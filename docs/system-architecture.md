# System Architecture (Initial)

## High-Level Components

1. **Web Client (SvelteKit)**
   - Agent dashboard
   - Caller profile and interaction timeline
   - Admin user/role management

2. **API/Edge Service**
   - Auth and RBAC enforcement
   - Business logic for caller and interaction updates
   - Webhook ingestion for telephony events

3. **Supabase Postgres Database**
   - Operational data (users, callers, interactions)
   - RBAC entities (roles, permissions, role mappings)
   - Audit logs for traceability

4. **Telephony Provider Integration**
   - Receives inbound call events via webhook
   - Maps call metadata to CRM entities

## Core Data Flow
1. Telephony provider sends inbound call webhook.
2. API validates webhook and upserts caller record by normalized phone number.
3. API creates interaction record and assigns or routes to an agent.
4. Agent updates interaction outcome in UI.
5. API enforces permission checks and writes audit entries for all updates.

## RBAC Approach
- Roles map to permissions (many-to-many)
- Users map to roles (many-to-many)
- Permission checks happen server-side on every write operation
- UI uses effective permissions to show/hide controls, but server remains the source of truth

## Security Baseline
- Password hashing (Argon2 or bcrypt)
- JWT access tokens with short TTL + refresh tokens
- Server-side input validation for all request payloads
- Audit log immutability pattern (append-only)

## Scaling Notes
- Add background worker for webhook retries and side effects
- Add websocket/event stream for real-time agent dashboards
- Partition large interaction/audit tables when necessary
