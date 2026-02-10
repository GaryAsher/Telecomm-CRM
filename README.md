# Telecomm-CRM

Attempt at trying to make software that functionally works as a database and can receive caller information.

## Current project status
This repository now includes an implementation foundation for a Telecomm CRM:
- Phased implementation roadmap in `docs/implementation-roadmap.md`
- Initial architecture design in `docs/system-architecture.md`
- PostgreSQL starter schema with RBAC + audit logging in `db/schema.sql`

## Stack recommendation
Given your existing stack (`GitHub/Cloudflare Pages`, `Supabase`, `Cloudflare security`, and `Svelte`), you can build this project without moving to React. See `docs/stack-recommendation.md` for details.

## Next steps
1. Stand up SvelteKit app + Supabase project configuration
2. Convert `db/schema.sql` into migrations in Supabase
3. Implement auth and RBAC middleware/policies
4. Build caller + interaction CRUD endpoints
5. Build a minimal dashboard UI for agent workflows


## Run a working prototype locally
A clickable prototype UI is available in `prototype/`.

1. Start the prototype server:
   ```bash
   ./scripts/run-prototype.sh
   ```
2. Open your browser to `http://localhost:4173`
3. Click a caller in **Active Queue**, then submit an interaction in **Log Interaction**

This prototype is intentionally frontend-only (mock data) so you can validate workflow quickly before connecting Supabase and telephony webhooks.
