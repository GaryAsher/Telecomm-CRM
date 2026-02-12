# Telecrom — CRM System

A telephone agent CRM built with **SvelteKit** + **Supabase** + **TypeScript**.

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `db/schema.sql` — this creates all tables, roles, permissions, RLS policies, and seed data
3. Copy your project credentials:

```bash
cp .env.example .env
```

Fill in your `.env`:

```
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 3. Create your first user

1. Go to Supabase Dashboard → **Authentication** → **Users** → **Add User**
2. Or sign up through the app's login page
3. Assign a role: run this in the SQL Editor:

```sql
-- Replace 'your-user-uuid' with the user's auth.users id
-- Replace 'admin' with desired role
INSERT INTO user_roles (user_id, role_id)
SELECT 'your-user-uuid', r.id FROM roles r WHERE r.name = 'admin';
```

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Project Structure

```
telecrom-app/
├── db/
│   └── schema.sql                  # Full Postgres schema (run in Supabase SQL Editor)
├── src/
│   ├── app.css                     # Global design tokens
│   ├── app.d.ts                    # App-wide TypeScript types
│   ├── app.html                    # HTML shell
│   ├── hooks.server.ts             # Auth guard, session handling, security headers
│   ├── lib/
│   │   ├── types.ts                # Domain types, status config
│   │   ├── server/
│   │   │   ├── supabase.ts         # Server-side Supabase client factory
│   │   │   └── rbac.ts             # Permission checks, audit logging
│   │   └── components/
│   │       └── Sidebar.svelte      # Navigation sidebar
│   └── routes/
│       ├── +layout.svelte          # Root layout (Supabase browser client init)
│       ├── +layout.server.ts       # Session data for all pages
│       ├── login/                   # Login/signup (email + password)
│       ├── (app)/                   # Authenticated route group
│       │   ├── +layout.svelte      # App shell with sidebar
│       │   ├── +layout.server.ts   # Loads sidebar badge counts
│       │   ├── +page.*             # Dashboard
│       │   ├── queue/              # Call queue (CRUD + status updates)
│       │   ├── companies/          # Company directory
│       │   ├── contacts/           # Contacts table
│       │   ├── log/                # Interaction history
│       │   └── admin/              # Roles & system stats
│       └── api/
│           └── webhooks/
│               └── telephony/      # Inbound call webhook endpoint
```

---

## Architecture

### Authentication

- **Supabase Auth** handles signup, login, and JWT management
- Session tokens stored in **httpOnly cookies** (not localStorage) via `@supabase/ssr`
- `hooks.server.ts` validates the JWT with `getUser()` on every request
- Protected routes redirect to `/login` if no valid session

### Authorization (RBAC)

- 4 built-in roles: `admin`, `supervisor`, `agent`, `viewer`
- Permissions are granular: `callers.read`, `callers.write`, `interactions.write`, etc.
- **Server-side enforcement**: every form action calls `requirePermissions()` before mutating data
- **Row Level Security**: Supabase RLS policies restrict reads at the database layer
- Write operations use the **service role client** (bypasses RLS) after permission checks

### Data Flow

1. All form submissions use SvelteKit form actions (`use:enhance`)
2. Server actions validate permissions → mutate via service client → write audit log
3. Page data loads via `+page.server.ts` using the user-scoped Supabase client
4. RLS ensures users only see data they're authorized for

### Security Headers

Applied automatically by `hooks.server.ts`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Telephony Webhook

`POST /api/webhooks/telephony` accepts inbound call events:

```json
{
  "phone": "+15551234567",
  "caller_name": "Jordan Lee",
  "call_sid": "CA123abc"
}
```

Upserts the caller by normalized phone number and creates an interaction record.

---

## Deployment

This project uses `@sveltejs/adapter-auto` which automatically detects your deployment platform.

**Recommended options (per stack-recommendation.md):**

- **Cloudflare Pages**: `npm i -D @sveltejs/adapter-cloudflare` — best performance + built-in WAF
- **Vercel**: Works out of the box with adapter-auto
- **Node server**: `npm i -D @sveltejs/adapter-node` — for self-hosted

Remember to set environment variables in your deployment platform.

---

## Next Steps

- [ ] Add Supabase Realtime for live queue updates
- [ ] Implement proper telephony provider signature verification
- [ ] Add agent assignment logic and routing
- [ ] Build audit log viewer in admin panel
- [ ] Add phone number masking in UI
- [ ] Set up Supabase CLI for type generation (`supabase gen types typescript`)
