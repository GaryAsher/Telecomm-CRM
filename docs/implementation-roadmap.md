# Telecomm CRM Implementation Roadmap

## Objective
Build a system that functionally mirrors a telephone-agent workflow with:
- Caller intake and interaction history
- Database-backed CRM records
- Role-based permissions for updating records
- A user interface that is clear for non-technical users

---

## Phase 0: Foundation (Week 1)

### Deliverables
- Architecture decision record (stack + deployment model)
- Database schema draft with RBAC and audit logs
- API contract draft (OpenAPI or equivalent)
- Clickable low-fidelity UI screens for core workflows

### Success criteria
- Team agrees on MVP boundaries
- Data model supports callers, interactions, assignments, and permissioned edits
- Risks are documented (telephony webhook reliability, data security)

---

## Phase 1: MVP Vertical Slice (Weeks 2-4)

### Scope
1. User authentication and role checks
2. Caller record CRUD
3. Call interaction logging
4. Basic dashboard for agents
5. Admin user management for role assignment

### Success criteria
- Agent can log in, see assigned callers, and update notes/status if authorized
- Admin can create users and assign roles
- All edits are audit logged

---

## Phase 2: Telephony Integration (Weeks 5-7)

### Scope
- Inbound webhook endpoint for call events
- Auto-create or match caller records by phone number
- Real-time UI updates for active calls
- Call outcome disposition workflow

### Success criteria
- Inbound call creates/updates CRM context automatically
- Agent can complete a call workflow in < 30 seconds of post-call work

---

## Phase 3: Usability and Hardening (Weeks 8-10)

### Scope
- Role-based UI simplification (agent vs admin views)
- Input validation and error state improvements
- Performance and query optimization
- Security controls (rate limits, secure headers, logs)

### Success criteria
- Core workflows validated via usability testing
- No critical security findings in baseline review
- Dashboard remains responsive under expected concurrent usage

---

## Recommended Tech Stack
- Frontend: SvelteKit + TypeScript (recommended based on existing experience)
- Backend/API: Supabase Edge Functions and/or Cloudflare Workers for webhook/API logic
- Database: Supabase Postgres
- Auth: Supabase Auth + RBAC enforced server-side
- Infrastructure: Cloudflare Pages + Cloudflare security controls
- Alternative path: React + NestJS remains viable if team/hiring priorities require it

---

## Initial API Domain Modules
- `auth`: login, refresh, profile
- `users`: user management, role assignment
- `callers`: caller records
- `interactions`: call logs, notes, outcomes
- `permissions`: effective permission checks
- `audit`: immutable change history

---

## Non-Functional Requirements
- Auditability: every write to sensitive business entities must be tracked
- Reliability: webhook processing should be idempotent
- Security: least-privilege default role permissions
- Usability: 3-click path to the most common tasks

---

## Suggested Next Action
Start with backend-first setup:
1. Create migration files from the initial schema in `db/schema.sql`
2. Implement auth + RBAC middleware
3. Implement caller and interaction endpoints
4. Build a minimal dashboard on top of those endpoints
