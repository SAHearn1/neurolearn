# Debug Playbook — neurolearn

| Symptom | Check First | Common Root Cause |
|---------|-------------|-------------------|
| Supabase 403 | RLS policies | Row-level security blocking query |
| Auth token invalid | Supabase session | Token expired |
| Vite build fails | `npm run typecheck` | TypeScript regression |
| Playwright test fails | `.env.test` | Test env vars not set |
| Sentry not capturing | SENTRY_DSN | Missing DSN |
| Vercel deploy fails | Build output | TypeScript or env var issue |

*See: [RWFW Debug Playbook](https://github.com/SAHearn1/rwfw-agent-governance/blob/main/docs/DEBUG_PLAYBOOK.md)*
