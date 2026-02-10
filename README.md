# Tele-CRM

Attempt at trying to make software that functionally works as a database and can receive caller information.

## Current project status
This repository now includes an implementation foundation for a Tele-CRM:
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

### Troubleshooting (most common issues)
- **`./scripts/run-prototype.sh: Permission denied`**
  - Quick workaround (no chmod needed): `bash scripts/run-prototype.sh`
  - Permanent fix: `chmod +x scripts/run-prototype.sh`
  - If this keeps happening after pulls: `git update-index --chmod=+x scripts/run-prototype.sh`
- **`No such file or directory` for the script**
  - Make sure you are in the repo root first: `cd /workspace/Tele-CRM`
- **`python3: command not found`**
  - Use: `python -m http.server 4173 -d prototype`
- **Port already in use**
  - Run on a different port: `./scripts/run-prototype.sh 4180`
  - Then open: `http://localhost:4180`
- **Script still doesn't work**
  - Bypass the script directly:
    ```bash
    cd prototype
    python3 -m http.server 4173
    ```


### GitHub vs local files (important)
Yes—this can absolutely be the reason.
If your changes are on GitHub but not on your computer, your local folder will not show them until you sync.

If you have **not cloned** the repo yet:
```bash
git clone <your-repo-url>
cd Tele-CRM
```

If you already cloned it before, but GitHub has newer commits:
```bash
cd Tele-CRM
git pull origin <your-branch>
```

Quick check that local has the latest commit:
```bash
git fetch

git status
git log --oneline -n 5
```

After syncing, run the prototype again:
```bash
./scripts/run-prototype.sh
```


### Running in GitHub Codespaces / VS Code terminal
From your repo root, run:
```bash
pwd
ls -l scripts/run-prototype.sh
bash scripts/run-prototype.sh
```
Then open the forwarded port URL for `4173` (or `http://localhost:4173`).


## Simple company/employee database template
A simplified schema for your current call-center use case is available at:
- `db/simple-directory-schema.sql`

It includes:
- `companies` table with company name, location, and hours
- `company_employees` table with name, phone, email, and 3 boolean placeholders

To apply later in Postgres/Supabase, run the SQL as a migration.


## One-click push helper in Codespaces
If you want a clickable way to commit + push from Codespaces:

1. Open the Command Palette (`Ctrl/Cmd + Shift + P`)
2. Run: `Tasks: Run Task`
3. Select: `Tele-CRM: Push Local Changes`

This runs:
```bash
bash scripts/push-changes.sh
```

You can also run it manually with an optional custom commit message:
```bash
bash scripts/push-changes.sh "feat: your commit message"
```
