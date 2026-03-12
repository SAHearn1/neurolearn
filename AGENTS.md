# AGENTS.md — neurolearn

**NeuroLearn — Multimodal learning app for neurodivergent learners**
**Governance Hub:** [SAHearn1/rwfw-agent-governance](https://github.com/SAHearn1/rwfw-agent-governance)

## Stack

React 19 + Vite + TypeScript + Supabase + Vercel + Sentry + Playwright

## Rules

1. Read before acting. 2. Identify first failing boundary. 3. Smallest viable fix.
2. Run `npm run lint`, `npm run typecheck`, `npm run test` before marking done.
3. Governance-only scope: `/docs/`, `/.github/`, `/AGENTS.md`, `/repo.intelligence.yml`, root markdown.
4. Git issue execution override: when explicitly directed to execute repository issues, the write scope is temporarily expanded to `src/`, `supabase/`, `tests/`, `docs/`, and workflow/config files required to complete the confirmed fix boundary.

## Commands

```bash
npm run dev          # Vite dev server
npm run build        # tsc --noEmit && vite build
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint
npm run test         # Vitest
npm run test:e2e     # Playwright
```

_Governed by: [SAHearn1/rwfw-agent-governance](https://github.com/SAHearn1/rwfw-agent-governance)_
