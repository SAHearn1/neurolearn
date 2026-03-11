# Incident Log — neurolearn

_Part of: SAHearn1/rwfw-agent-governance ecosystem_

---

## INC-001 — 2026-03-09 — Web Lock deadlock on login (authStore)

**Severity:** Critical — all authenticated flows blocked
**Detected:** Authenticated QA via Playwright (session `7ed591cb`)
**Fixed:** Commit `e8b902e`

**Root cause:** `loadRole()` was called inside the `onAuthStateChange` callback. The Supabase JS v2 client's REST methods (`supabase.from()`) internally call `getSession()` which acquires the same Web Lock held by the `onAuthStateChange` callback. This caused a deadlock: the callback waited for `loadRole` to complete, but `loadRole` waited for the Web Lock to be released. The login button stayed permanently disabled and `initialized` never became `true`.

**Fix:** Made `onAuthStateChange` synchronous — set `initialized: true` and core auth state immediately, then deferred `loadRole` via `setTimeout(0)` to run outside the Web Lock context. Removed redundant `loadRole` calls from `signIn` and `signUp` (the deferred `onAuthStateChange` handler covers them).

**Files changed:** `src/store/authStore.ts`

---

## INC-002 — 2026-03-09 — Role-gated routes redirect during async role load (ProtectedRoute)

**Severity:** High — educator/parent/admin portals inaccessible after login
**Detected:** Authenticated QA via Playwright (session `7ed591cb`)
**Fixed:** Commit `472fb8c`

**Root cause:** After INC-001 fix, `initialized` is set `true` immediately while `role` is still `null` (loaded async). `ProtectedRoute`'s `isLoading` check (`!initialized || loading`) cleared while `role` was still null, causing `hasAccess` to be `false` and triggering an immediate redirect to `/dashboard` for any role-gated route.

**Fix:** Added `roleLoading: boolean` to the auth store. Set to `true` when deferred hydration starts, `false` when `loadRole` resolves. `ProtectedRoute` now includes `roleLoading` in its `isLoading` check.

**Files changed:** `src/store/authStore.ts`, `src/components/auth/ProtectedRoute.tsx`

---

## INC-003 — 2026-03-09 — Educator LCP dashboard schema join error

**Severity:** Medium — Cognitive Growth tab in educator portal non-functional
**Detected:** Authenticated QA via Playwright (session `7ed591cb`)
**Fixed:** Commit (this session)

**Root cause:** `useStudentCognitiveProfiles` used a PostgREST named FK hint `profiles!educator_student_links_student_id_fkey` which does not exist — `educator_student_links.student_id` has no database FK constraint to `profiles`. PostgREST's schema cache could not resolve the join.

**Fix:** Replaced the implicit join with an explicit two-step query: fetch `student_id` values from `educator_student_links`, then fetch `profiles` by `user_id IN (studentIds)`. The `displayNameMap` replaces the old joined result.

**Files changed:** `src/hooks/useStudentCognitiveProfiles.ts`

---

## INC-004 — 2026-03-09 — E2E seed script profiles inserted with wrong column

**Severity:** Low — E2E test accounts had no profiles, causing loadRole to hang
**Detected:** Authenticated QA via Playwright (session `7ed591cb`)
**Fixed:** Direct SQL correction (not a code fix — seed script uses Supabase admin API)

**Root cause:** `scripts/seed-e2e.ts` inserted profiles with `{ id: userId, ... }` but the `profiles` table uses `user_id` (not `id`) as the auth user foreign key. The profiles were silently dropped or went to the wrong column, leaving `loadRole` queries returning 0 rows.

**Fix:** Inserted correct profiles via direct SQL with `user_id` column. The seed script should be updated to upsert by `user_id` rather than `id`.

**Files changed:** None (SQL fix applied directly; seed script fix noted)

---

## INC-005 — 2026-03-10 — Large client bundle (518 kB) degrading initial load performance

**Severity:** Medium — Build warning on every production build; degraded load on low-bandwidth networks
**Detected:** Vite build output warning (chunk size exceeds 500 kB limit)
**Fixed:** PR #276

**Root cause:** The main entry bundle (`index.js`) included all vendor dependencies (`@supabase/supabase-js`, `@sentry/react`, `react-router-dom`, `zustand`, `zod`) plus all public route pages (LoginPage, SignUpPage, PasswordResetPage, CheckEmailPage, UpdatePasswordPage, HomePage) bundled eagerly. No `manualChunks` splitting was configured.

**Fix:**

1. Added `build.rollupOptions.output.manualChunks` in `vite.config.ts` to split large vendor libraries into separately cacheable chunks (`vendor-router`, `vendor-supabase`, `vendor-sentry`, `vendor-state`).
2. Converted all eagerly-imported public pages in `App.tsx` to lazy imports via `React.lazy()` / dynamic `import()`, so only the shell code is in the entry chunk.

**Result:** Main bundle reduced from 518 kB → 192 kB (63% reduction). No chunks exceed 400 kB. Build warning eliminated.

**Files changed:** `vite.config.ts`, `src/App.tsx`

---

## INC-006 — 2026-03-10 — RACA engine disabled by default via feature flags

**Severity:** High — adaptive session experience never activated; users always received fallback UI
**Detected:** Issue review / code inspection (this session)
**Fixed:** PR #274

**Root cause:** `.env.example` set all `VITE_RACA_ENABLE_*` flags to `false`. `feature-flags.ts` treated any absent/false env var as `false`, so the engine was always off unless every flag was manually set. `SessionPage` gated on `racaFlags.runtime` and showed a fallback UI whenever it was `false`. `useRacaSession.start()` additionally blocked session start when `racaFlags.runtime` was `false`.

**Fix:**

- `feature-flags.ts`: `readFlag()` now accepts a `devDefault` parameter (default `true`). In development, when a flag env var is absent or empty the dev default is used rather than defaulting to `false`. Flags requiring external services (`AGENTS`, `AUDIT`) default to `false`.
- `.env.example`: Updated development defaults — stable flags set to `true`; service-dependent flags (`AGENTS`, `AUDIT`) remain `false` with explanatory comments.
- `useRacaSession.ts`: Removed the redundant `!racaFlags.runtime` guard in `start()` — `SessionPage` already gates on this flag before rendering.
- Added 29 new unit tests covering session engine initialisation, adaptive loop, and regulation state updates.

**Files changed:** `src/lib/raca/feature-flags.ts`, `src/hooks/useRacaSession.ts`, `.env.example`, `src/lib/raca/layer0-runtime/session-manager.test.ts` (new), `src/lib/raca/layer4-epistemic/adaptation-engine.test.ts` (new)
