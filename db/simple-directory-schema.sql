-- Simple call-center directory schema (PostgreSQL)
-- Requested fields:
-- - Company name
-- - Location
-- - Hours
-- - Employees (name, phone number, email, and 3 boolean placeholders)

CREATE TABLE IF NOT EXISTS companies (
  id BIGSERIAL PRIMARY KEY,
  company_name TEXT NOT NULL,
  location TEXT NOT NULL,
  hours TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS company_employees (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  phone_number TEXT,
  email TEXT,
  placeholder_boolean_1 BOOLEAN NOT NULL DEFAULT FALSE,
  placeholder_boolean_2 BOOLEAN NOT NULL DEFAULT FALSE,
  placeholder_boolean_3 BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_company_employees_company_id
  ON company_employees(company_id);

CREATE INDEX IF NOT EXISTS idx_company_employees_email
  ON company_employees(email);

-- Optional starter seed data
INSERT INTO companies (company_name, location, hours)
VALUES
  ('Northside Family Practice', 'Springfield, IL', 'Mon-Fri 8:00 AM - 5:00 PM'),
  ('Riverbend Internal Medicine', 'Columbus, OH', 'Mon-Sat 9:00 AM - 6:00 PM')
ON CONFLICT DO NOTHING;

INSERT INTO company_employees (
  company_id,
  employee_name,
  phone_number,
  email,
  placeholder_boolean_1,
  placeholder_boolean_2,
  placeholder_boolean_3
)
SELECT
  c.id,
  e.employee_name,
  e.phone_number,
  e.email,
  e.placeholder_boolean_1,
  e.placeholder_boolean_2,
  e.placeholder_boolean_3
FROM (
  VALUES
    ('Northside Family Practice', 'Avery Brooks', '+1-555-111-2233', 'avery@northside.example', TRUE, FALSE, FALSE),
    ('Northside Family Practice', 'Riley Carter', '+1-555-111-7788', 'riley@northside.example', FALSE, TRUE, FALSE),
    ('Riverbend Internal Medicine', 'Jordan Hayes', '+1-555-222-9900', 'jordan@riverbend.example', FALSE, FALSE, TRUE)
) AS e(company_name, employee_name, phone_number, email, placeholder_boolean_1, placeholder_boolean_2, placeholder_boolean_3)
JOIN companies c
  ON c.company_name = e.company_name
ON CONFLICT DO NOTHING;
