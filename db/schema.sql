-- Initial PostgreSQL schema for Tele-CRM MVP

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roles (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS callers (
  id BIGSERIAL PRIMARY KEY,
  phone_number TEXT NOT NULL,
  normalized_phone TEXT NOT NULL UNIQUE,
  full_name TEXT,
  account_reference TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interactions (
  id BIGSERIAL PRIMARY KEY,
  caller_id BIGINT NOT NULL REFERENCES callers(id) ON DELETE CASCADE,
  assigned_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  interaction_type TEXT NOT NULL DEFAULT 'call',
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  outcome TEXT,
  notes TEXT,
  created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  actor_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id BIGINT NOT NULL,
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_callers_normalized_phone ON callers(normalized_phone);
CREATE INDEX IF NOT EXISTS idx_interactions_caller_id ON interactions(caller_id);
CREATE INDEX IF NOT EXISTS idx_interactions_assigned_user_id ON interactions(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_user_id);

INSERT INTO roles (name, description)
VALUES
  ('admin', 'Full access to users, roles, and CRM records'),
  ('supervisor', 'Can monitor and manage team interaction workflows'),
  ('agent', 'Can view/update assigned caller interactions'),
  ('viewer', 'Read-only access to caller records')
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (key, description)
VALUES
  ('users.manage', 'Create/update/deactivate users'),
  ('roles.manage', 'Assign roles and permissions'),
  ('callers.read', 'View caller records'),
  ('callers.write', 'Create and update caller records'),
  ('interactions.read', 'View interaction records'),
  ('interactions.write', 'Create and update interactions'),
  ('audit.read', 'View audit logs')
ON CONFLICT (key) DO NOTHING;
