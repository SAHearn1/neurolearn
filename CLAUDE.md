# CLAUDE.md — neurolearn

> Agent briefing. Read before touching code.
> Governance hub: `SAHearn1/rwfw-agent-governance`

## Repo Identity
- **Purpose:** Neurolearn — adaptive learning platform
- **Tier:** 2 (active support)
- **Stack:** React 19 + Vite + Supabase + Vercel

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite + TypeScript |
| Auth | Supabase Auth |
| Database | Supabase PostgreSQL + RLS |
| Deployment | Vercel |

## Critical Rules

- **RLS is the security layer.** Every Supabase table has row-level security. Verify policies before any data access pattern.
- **React 19 concurrent features** — use `use()`, `useTransition()` appropriately. Do not mix React 18 and 19 patterns.
- **VITE_ prefix required** for all client-side env vars.
- **No `git add .`**

## Dev Workflow
```bash
npm install && npm run dev
npm run lint && npm run type-check && npm run build
```

## Env Vars
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

## Governance
Follow `AGENTS.md`. Debug via `docs/AGENT_DEBUG_RUNBOOK.md`.
