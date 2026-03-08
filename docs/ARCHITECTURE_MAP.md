# Architecture Map — neurolearn

React 19 SPA + Vite. Supabase (auth + database + storage). Vercel deployment. Sentry error tracking. Playwright E2E testing.

## Layers
- UI: React 19 + Vite + Tailwind CSS
- Auth: Supabase Auth
- Data: Supabase PostgreSQL + @supabase/supabase-js
- State: Zustand
- Validation: Zod
- Security: DOMPurify
- Deployment: Vercel
- Monitoring: Sentry + @vercel/analytics

*Part of: SAHearn1/rwfw-agent-governance ecosystem*
