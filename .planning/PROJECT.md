# NeuroLearn — Project Context

## What Is This?
NeuroLearn is a multimodal adaptive learning platform for neurodivergent learners
(ADHD, dyslexia, autism spectrum). It pairs a React + TypeScript SPA with a
Supabase backend and a 5-layer RACA (RootWork Agentic Cognitive Architecture)
that prevents AI from collapsing a learner's reasoning process.

## Tech Stack
| Layer | Choice | Notes |
|-------|--------|-------|
| Frontend | React 18 + Vite + TypeScript | Strict mode, code-split (13 chunks) |
| Styling | Tailwind CSS 3.4 | Utility-first, no CSS-in-JS |
| State | Zustand 4.5 | 4 stores: auth, settings, progress, raca |
| Backend | Supabase | PostgreSQL + RLS + Edge Functions |
| Validation | Zod 4.x | All forms and API boundaries |
| Routing | react-router-dom v6 | React.lazy per route |
| Testing | Vitest + React Testing Library | 24 tests passing |
| E2E | Playwright (planned) | |
| CI | GitHub Actions | typecheck + lint + test + build |
| Deploy | Vercel | Security headers + edge network |

## Architecture Constraints
1. **RLS everywhere** — every new table MUST have RLS policies
2. **Zod at boundaries** — all user input, all API responses must be validated
3. **Accessibility first** — WCAG 2.1 AA; ARIA roles on all interactive elements
4. **Feature flags** — RACA features gated behind 8 VITE_RACA_* env flags
5. **TypeScript strict** — zero `any`, zero `ts-ignore`, imports must resolve
6. **CI gates** — `npm run typecheck && npm run lint && npm run test -- --run && npm run build` must pass after every plan

## Key Files
- `src/lib/raca/` — 30-file RACA architecture (DO NOT modify without reading ADR-002)
- `src/lib/validation.ts` — central Zod schema registry (add new schemas here)
- `src/types/` — shared TypeScript types (keep in sync with DB schema)
- `supabase/migrations/` — numbered SQL migrations (sequential, never delete)
- `.env.example` — environment variable template (update when adding new vars)

## DB Migration Conventions
- File naming: `NNNN_description.sql` (next: `0017_educator_profiles.sql`)
- Always include: CREATE TABLE, RLS ENABLE, policies (SELECT/INSERT/UPDATE), indexes
- Use `auth.uid()` in RLS, not hardcoded IDs

## Code Conventions
- Hooks return `{ data, loading, error }` and use `useEffect` + Supabase client
- Components are functional, typed with React.FC or explicit prop interfaces
- New pages use `React.lazy` + `<Suspense>` in `App.tsx`
- Tests use factories from `src/lib/test-utils.ts`

## Validation Baseline (must pass after every plan)
```bash
npm run typecheck   # 0 errors
npm run lint        # 0 warnings
npm run test -- --run  # 24/24 passing (add tests, never reduce)
npm run build       # clean build, 0 errors
```

## Current Completion
- **67% complete** (80/120 issues closed as of 2026-03-02)
- Phases 01–10 fully complete (foundation, RACA, security, a11y, testing, docs)
- Phases 11–17 remaining (portals, compliance, testing, learner features, observability)
