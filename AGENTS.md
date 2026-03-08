# AGENTS.md — neurolearn
**NeuroLearn — Multimodal learning app for neurodivergent learners**
**Governance Hub:** [SAHearn1/rwfw-agent-governance](https://github.com/SAHearn1/rwfw-agent-governance)

## Stack
React 19 + Vite + TypeScript + Supabase + Vercel + Sentry + Playwright

## Rules
1. Read before acting. 2. Identify first failing boundary. 3. Smallest viable fix.
4. Run `npm run lint`, `npm run typecheck`, `npm run test` before marking done.
5. Governance-only scope: `/docs/`, `/.github/`, `/AGENTS.md`, `/repo.intelligence.yml`, root markdown.

## Commands
```bash
npm run dev          # Vite dev server
npm run build        # tsc --noEmit && vite build
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint
npm run test         # Vitest
npm run test:e2e     # Playwright
```

*Governed by: [SAHearn1/rwfw-agent-governance](https://github.com/SAHearn1/rwfw-agent-governance)*
