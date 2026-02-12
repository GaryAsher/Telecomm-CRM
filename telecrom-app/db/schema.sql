-- ═══════════════════════════════════════════════════════════════
-- Telecrom CRM — Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── AUTH PROFILES ──────────────────────────────────────────
-- Extends Supabase auth.users with app-specific fields
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  display_name TEXT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ─── RBAC ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key         TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_id     UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);


-- ─── COMPANIES & CONTACTS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name  TEXT NOT NULL,
  location      TEXT NOT NULL DEFAULT '',
  hours         TEXT NOT NULL DEFAULT '',
  phone         TEXT NOT NULL DEFAULT '',
  company_type  TEXT NOT NULL DEFAULT 'Other',
  employee_count INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contacts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id    UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  title         TEXT NOT NULL DEFAULT '',
  phone         TEXT NOT NULL DEFAULT '',
  email         TEXT NOT NULL DEFAULT '',
  is_primary    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─── CALLERS & INTERACTIONS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS callers (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number      TEXT NOT NULL,
  normalized_phone  TEXT NOT NULL UNIQUE,
  full_name         TEXT,
  account_reference TEXT,
  company_id        UUID REFERENCES companies(id) ON DELETE SET NULL,
  reason            TEXT NOT NULL DEFAULT '',
  status            TEXT NOT NULL DEFAULT 'new'
                      CHECK (status IN ('new','in-progress','follow-up','escalated','resolved')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interactions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  caller_id         UUID NOT NULL REFERENCES callers(id) ON DELETE CASCADE,
  assigned_user_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  interaction_type  TEXT NOT NULL DEFAULT 'call'
                      CHECK (interaction_type IN ('call','email','note')),
  direction         TEXT NOT NULL DEFAULT 'inbound'
                      CHECK (direction IN ('inbound','outbound')),
  started_at        TIMESTAMPTZ DEFAULT NOW(),
  ended_at          TIMESTAMPTZ,
  duration_seconds  INTEGER,
  outcome           TEXT,
  notes             TEXT,
  created_by        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─── AUDIT LOG (append-only) ────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  entity_type     TEXT NOT NULL,
  entity_id       UUID NOT NULL,
  action          TEXT NOT NULL,
  old_values      JSONB,
  new_values      JSONB,
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ─── INDEXES ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_contacts_company       ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_callers_normalized      ON callers(normalized_phone);
CREATE INDEX IF NOT EXISTS idx_callers_status           ON callers(status);
CREATE INDEX IF NOT EXISTS idx_callers_company          ON callers(company_id);
CREATE INDEX IF NOT EXISTS idx_interactions_caller      ON interactions(caller_id);
CREATE INDEX IF NOT EXISTS idx_interactions_assigned    ON interactions(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity             ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_actor              ON audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user          ON user_roles(user_id);


-- ─── SEED: ROLES & PERMISSIONS ──────────────────────────────
INSERT INTO roles (name, description) VALUES
  ('admin',      'Full access to users, roles, and CRM records'),
  ('supervisor', 'Can monitor and manage team interaction workflows'),
  ('agent',      'Can view/update assigned caller interactions'),
  ('viewer',     'Read-only access to caller records')
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (key, description) VALUES
  ('users.manage',       'Create/update/deactivate users'),
  ('roles.manage',       'Assign roles and permissions'),
  ('callers.read',       'View caller records'),
  ('callers.write',      'Create and update caller records'),
  ('interactions.read',  'View interaction records'),
  ('interactions.write', 'Create and update interactions'),
  ('companies.read',     'View company directory'),
  ('companies.write',    'Create and update companies'),
  ('contacts.read',      'View contact records'),
  ('contacts.write',     'Create and update contacts'),
  ('audit.read',         'View audit logs')
ON CONFLICT (key) DO NOTHING;

-- Wire default role→permission mappings
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'supervisor' AND p.key IN (
  'callers.read','callers.write','interactions.read','interactions.write',
  'companies.read','companies.write','contacts.read','contacts.write','audit.read'
)
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'agent' AND p.key IN (
  'callers.read','callers.write','interactions.read','interactions.write',
  'companies.read','contacts.read'
)
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'viewer' AND p.key IN (
  'callers.read','interactions.read','companies.read','contacts.read'
)
ON CONFLICT DO NOTHING;


-- ─── ROW LEVEL SECURITY ─────────────────────────────────────
-- All authenticated users can read; writes checked by server.
-- You can tighten these per-role using the user_roles join.

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile"     ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"   ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users read companies" ON companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role manages companies"     ON companies FOR ALL TO service_role USING (true);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users read contacts" ON contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role manages contacts"     ON contacts FOR ALL TO service_role USING (true);

ALTER TABLE callers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users read callers" ON callers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role manages callers"     ON callers FOR ALL TO service_role USING (true);

ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users read interactions" ON interactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role manages interactions"     ON interactions FOR ALL TO service_role USING (true);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages audit_logs" ON audit_logs FOR ALL TO service_role USING (true);


-- ─── HELPER: get user permissions ───────────────────────────
CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid UUID)
RETURNS SETOF TEXT AS $$
  SELECT DISTINCT p.key
  FROM user_roles ur
  JOIN role_permissions rp ON rp.role_id = ur.role_id
  JOIN permissions p ON p.id = rp.permission_id
  WHERE ur.user_id = user_uuid;
$$ LANGUAGE sql SECURITY DEFINER STABLE;
