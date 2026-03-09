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
