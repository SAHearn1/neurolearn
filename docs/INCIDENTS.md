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

---

## INC-007 — 2026-03-10 — Insufficient test coverage across hooks, pages, and dashboard components

**Severity:** Low — no runtime behavior changed; risk of undetected regressions
**Detected:** Manual audit of test count vs module count (issue #270)
**Fixed:** PR #275

**Root cause:** Feature development prioritized delivery over test coverage. The repository had ~182 source files but only 13 test files (~79 tests), leaving hooks, dashboard components, pages, and RACA runtime modules entirely untested.

**Fix:** Added 15 new test files covering:

- `src/components/dashboard/` — CourseCard, ProgressWidget, RecentActivity, StreakBadge
- `src/hooks/` — useAuth, useUserRole, useSettings, useAdaptiveLearning, useRacaSession
- `src/pages/` — LoginPage (form rendering, validation, sign-in success/error flows), SessionPage
- `src/lib/raca/layer0-runtime/` — session-manager (start/end/recordEvent), runtime-reducer (all action types)
- `src/lib/raca/layer1-cognitive-fsm/` — preconditions (all 9 cognitive states)
- `src/store/progressStore.ts` — fetchCourseProgress, fetchLessonProgress, updateLessonProgress

Line coverage increased from ~64% to ~73%, meeting the ≥70% acceptance criterion. Also added `@vitest/coverage-v8` dependency and excluded `coverage/**` from ESLint.

**Files changed:** 15 new test files, `package.json`, `eslint.config.js`

---

## INC-008 — 2026-03-11 — Header/Sidebar/Footer shell never mounts (PageWrapper not wired to router)

**Severity:** High — no persistent navigation, no logout button accessible to any authenticated user
**Detected:** Student role E2E exploration (this session)
**Fixed:** Not yet fixed

**Root cause:** `App.tsx` does not use `PageWrapper` as a layout route. Every authenticated page (`DashboardPage`, `CoursesPage`, etc.) is wrapped directly in `<ProtectedRoute><PageX /></ProtectedRoute>` without a parent `<Route element={<PageWrapper />}>`. The `Header`, `Sidebar`, and `Footer` components exist at `src/components/layout/` but are never mounted. DOM inspection at runtime confirmed `document.querySelector('header')` returns `null` on all authenticated pages.

**Impact:** No global nav (Dashboard / Courses / Profile / Settings links), no logout/sign-out button reachable by mouse or keyboard, no sidebar. Users can only navigate via in-page links and the quick-links section at the bottom of DashboardPage.

**Fix required:** In `App.tsx`, wrap all authenticated routes under a parent layout route: `<Route element={<PageWrapper />}> ... </Route>`, replacing the current flat `<ProtectedRoute>` wrapping pattern. Alternatively, include `<Header>` directly inside `ProtectedRoute` as a workaround.

**Files to change:** `src/App.tsx`

---

## INC-009 — 2026-03-11 — RACA session heading shows raw lesson UUID instead of lesson title

**Severity:** Medium — confusing UX, unprofessional display in session header
**Detected:** Student role E2E exploration (this session)
**Fixed:** Not yet fixed

**Root cause:** `SessionPage` renders the heading as `Lesson: {lessonId}` using the raw UUID from the URL params (`useParams()`), without fetching or displaying the actual lesson title. The lesson title is not passed to or fetched within `SessionPage`.

**Observed:** Heading reads "Lesson: 0b79d43d-1dd6-44f3-856e-b87b4c8be600" instead of "Lesson 2 — Core Concepts".

**Fix required:** Fetch the lesson record (title) in `SessionPage` using `lessonId` from `useParams()` and display the title in the heading.

**Files to change:** `src/pages/SessionPage.tsx`

---

## INC-010 — 2026-03-11 — Lesson content renders raw markdown instead of parsed HTML

**Severity:** Medium — lesson text unreadable; markdown syntax characters displayed literally
**Detected:** Student role E2E exploration (this session)
**Fixed:** Not yet fixed

**Root cause:** The Read tab (`TextLesson` / `LessonPage` read panel) and the Listen tab text panel both display `content_body` from the database as a raw string. Markdown is not parsed or rendered. Content such as `# Core Concepts\n\nThis is E2E test content` is shown verbatim including `#` and `\n`.

**Observed:** Read tab shows `# Core Concepts\n\nThis is E2E test content for automated testing.` as plain text. Listen mode lesson text panel shows the same.

**Fix required:** Integrate a markdown renderer (e.g. `react-markdown`) in the lesson content display component and in `ListenMode`'s text panel.

**Files to change:** Lesson content display component (likely `src/components/lesson/TextLesson.tsx` or equivalent), `src/components/lesson/ListenMode.tsx`

---

## INC-011 — 2026-03-11 — RACA audit trail flush fails with RLS policy violation

**Severity:** High — session audit events never persisted; compliance trail broken
**Detected:** Student role E2E exploration (this session)
**Fixed:** Not yet fixed

**Root cause:** Every RACA state transition triggers `audit-trail.ts` to flush events to `raca_audit_events`. The flush consistently fails with `[RACA Audit] Flush failed: new row violate...` — an RLS `INSERT` policy violation. The learner user (`e2e-learner@neurolearn.test`) does not satisfy the RLS insert policy for `raca_audit_events`.

**Console error:** `[ERROR] [RACA Audit] Flush failed: new row violate... src/lib/raca/layer0-runtime/audit-trail.ts:41`
**HTTP error:** `POST /rest/v1/raca_audit_events` → 403 (policy violation)

**Impact:** No audit trail is written for any session. RACA spec §X audit requirements are unmet. Session history and TRACE scoring may be degraded.

**Fix required:** Review and correct the RLS INSERT policy on `raca_audit_events`. Policy should allow authenticated learners to insert rows where `user_id = auth.uid()`. Check migration that created the table for the correct policy definition.

**Files to change:** Relevant Supabase migration for `raca_audit_events` RLS policies.

---

## INC-012 — 2026-03-11 — epistemic_profiles and adaptive_learning_state return HTTP 406 for learner

**Severity:** Medium — Cognitive Growth / TRACE radar on dashboard and profile page permanently empty for learners
**Detected:** Student role E2E exploration (this session)
**Fixed:** Not yet fixed

**Root cause:** Fetches to `epistemic_profiles?select=*&user_id=eq.<uid>` and `adaptive_learning_state?select=*&user_id=eq.<uid>&course_id=eq.<cid>` return HTTP 406. A 406 from PostgREST usually means the `Accept` header does not match available content types, or the query violates an RLS policy in a way that returns no rows and the client requests `return=representation`. Most likely cause: the learner has no row in `epistemic_profiles` (it is created lazily) and the RLS SELECT policy does not permit the query to return zero rows cleanly, or the table's RLS is blocking the SELECT entirely.

**Impact:** Dashboard "Your Thinking Profile" and "Cognitive Profile" sections always show empty state. Profile page "Cognitive Growth" always shows "Complete a deep learning session" even after sessions.

**Fix required:** Verify RLS SELECT policies on `epistemic_profiles` and `adaptive_learning_state` allow `auth.uid() = user_id`. Ensure the client handles a missing row (empty array) without triggering 406. Consider upserting an empty profile row on first login.

**Files to change:** Supabase migration for `epistemic_profiles` and `adaptive_learning_state` RLS policies; possibly `src/hooks/useCognitiveProfile.ts` and `src/hooks/useAdaptiveLearning.ts`.

---

## INC-013 — 2026-03-11 — Homepage does not redirect authenticated users to dashboard

**Severity:** Low — minor UX confusion; logged-in users see "Get started" CTA instead of dashboard entry point
**Detected:** Student role E2E exploration (this session)
**Fixed:** Not yet fixed

**Root cause:** `HomePage` (at `/`) does not check auth state. A logged-in user navigating to `/` sees the public marketing page with "Get started — it's free" and "I already have an account" CTAs, instead of being redirected to `/dashboard` or shown a "Go to dashboard" link.

**Fix required:** In `HomePage` (or in the `/` route definition), detect an active session and redirect to `/dashboard`.

**Files to change:** `src/pages/HomePage.tsx` or `src/App.tsx` (the `/` route)

---

## INC-014 — 2026-03-11 — Course detail progress counter shows wrong denominator (1/1 vs 1/3)

**Severity:** Low — misleading progress display
**Detected:** Student role E2E exploration (this session)
**Fixed:** Not yet fixed

**Root cause:** The course detail hero (CoursePage header) shows "1/1 lessons done" for a course with 3 lessons. The denominator is likely sourced from the progress table (lessons completed) rather than the total lesson count from the course record or lesson list.

**Observed:** Course "E2E Test Course — Reading Fundamentals" has 3 lessons. Header shows "1/1 lessons done" when 1 of 3 is complete.

**Fix required:** Compute denominator from total lesson count (from the lessons query), not from the progress count.

**Files to change:** `src/pages/CoursePage.tsx` or the progress calculation in the relevant hook.

---

## INC-010 — 2026-03-10 — Lesson content_body Markdown rendered as raw text in RichContentPanel

**Severity:** High — all learners see raw `#`, `**`, `\n` characters instead of formatted lesson content
**Detected:** Code audit
**Fixed:** This session

**Root cause:** `lessons.content_body` stores Markdown. `RichContentPanel.parseContent()` sliced the raw string into `HtmlBlock` segments and passed them directly to DOMPurify → `dangerouslySetInnerHTML`. DOMPurify sanitizes HTML, not Markdown — so Markdown symbols passed through verbatim and were rendered as literal text in the browser.

**Fix:** Added `marked` (v17) dependency. Added `looksLikeMarkdown()` heuristic and `markdownToHtml()` helper in `RichContentPanel.tsx`. All plain-text segments produced by `parseContent()` are now run through `markdownToHtml()` before being stored as `HtmlBlock.content`. The existing DOMPurify sanitization step remains unchanged — parse first, sanitize second. `ListenMode.stripHtml()` correctly receives HTML from this point forward and already uses `HTMLElement.textContent` to extract plain text for TTS, so no changes were needed there.

**Files changed:** `src/components/lesson/RichContentPanel.tsx`, `package.json` (added `marked`)

---

## INC-011 — 2026-03-11 — RACA audit trail flush fails when auditPersistence flag is enabled

**Severity:** High (when VITE_RACA_ENABLE_AUDIT=true) — audit trail empty for all learner sessions
**Detected:** Student role E2E exploration (Playwright, session `a57c1e78`)
**Fixed:** Deferred — audit flag defaults to `false`; no production impact until flag is enabled

**Root cause:** The INSERT policy on `raca_audit_events` is structurally correct (confirmed via `pg_policies`). The runtime failure is a client-side timing issue: `cognitive_sessions` INSERT may not have committed when the first `raca_audit_events` flush fires, causing the RLS subquery `session_id IN (SELECT id FROM cognitive_sessions WHERE user_id = auth.uid())` to return no rows and reject the INSERT. Only manifests when `VITE_RACA_ENABLE_AUDIT=true`.

**Fix required:** In `src/lib/raca/layer0-runtime/`, await confirmation of the `cognitive_sessions` row before starting the audit flush interval.

**Files to change:** `src/lib/raca/layer0-runtime/audit-trail.ts`, `src/lib/raca/layer0-runtime/session-manager.ts`

---

## INC-012 — 2026-03-11 — epistemic_profiles and adaptive_learning_state return HTTP 406

**Severity:** Medium — TRACE radar and Cognitive Profile permanently empty
**Detected:** Student role E2E exploration (Playwright, session `a57c1e78`)
**Fixed:** Commit `3c91b4a`

**Root cause:** `useCognitiveProfile` and `useAdaptiveLearning` called `.single()` which sends `Accept: application/vnd.pgrst.object+json`. PostgREST returns HTTP 406 when no row exists. RLS policies were correct.

**Fix:** Replaced `.single()` with `.maybeSingle()` in both hooks. Empty result now returns HTTP 200 with `null`.

**Files changed:** `src/hooks/useCognitiveProfile.ts`, `src/hooks/useAdaptiveLearning.ts`

---

## INC-013 — 2026-03-11 — Homepage renders for authenticated users instead of redirecting

**Severity:** Low — marketing page shown to logged-in users
**Detected:** Student role E2E exploration (Playwright, session `a57c1e78`)
**Fixed:** Commit `3c91b4a`

**Root cause:** `HomePage` had no auth check. The `/` route rendered unconditionally.

**Fix:** Added `useAuthStore` check at top of `HomePage`. Returns `<Navigate replace to="/dashboard" />` when user is authenticated.

**Files changed:** `src/pages/HomePage.tsx`

---

## INC-014 — 2026-03-11 — Course detail shows wrong progress denominator

**Severity:** Low — "1/1 lessons done" displayed for multi-lesson courses
**Detected:** Student role E2E exploration (Playwright, session `a57c1e78`)
**Fixed:** Commit `3c91b4a`

**Root cause:** `total = courseProgress?.total_lessons ?? lessons.length` — `total_lessons` stored in the progress row was incorrect (equal to completed count). The `??` fallback only fires when the value is null/undefined.

**Fix:** Changed to `total = lessons.length || courseProgress?.total_lessons || 0` — always prefers the live lesson count from the already-loaded `lessons` array.

**Files changed:** `src/pages/CoursePage.tsx`

---

## INC-011 — 2026-03-11 — RACA audit events rejected by RLS due to missing cognitive_sessions row

**Severity:** Medium — audit trail silent data loss when `racaFlags.auditPersistence` is enabled
**Detected:** Code review during Phase 21 planning
**Fixed:** Commit `406d55f`

**Root cause:** `start()` in `useRacaSession` was synchronous and never persisted the session to the DB before returning. The audit flush timer fires 5 seconds later with a `session_id` that doesn't exist in `cognitive_sessions` yet — the RLS policy on `raca_audit_events` performs a subquery against `cognitive_sessions` and rejects every INSERT. Additionally, `end()` called `flushAuditBuffer()` before `saveSessionRemote()`, creating the same race on termination.

**Fix:** Made `start()` async; `await saveSessionRemote()` immediately after `startSession()` when `racaFlags.auditPersistence` is true. In `end()`, moved `saveSessionRemote()` before `flushAuditBuffer()`. Both operations gated by the feature flag, so no behavior change in production (flag is OFF).

**Files changed:** `src/hooks/useRacaSession.ts`

---

## INC-012 — 2026-03-11 — ESLint `react-hooks/set-state-in-effect` in SessionPageCore (#324 wiring)

**Severity:** Low — build blocked until resolved
**Detected:** TypeScript/lint gate during Phase 22 implementation
**Fixed:** This session

**Root cause:** The `useEffect` for fetching prior mastery data called `setPriorDataLoaded(true)` synchronously in its early-return branch (when `user?.id` or `lessonId` were absent). The `react-hooks/set-state-in-effect` ESLint rule prohibits synchronous `setState` calls in the effect body's early-return path.

**Fix:** Wrapped the early-return `setState` call in `setTimeout(0)`, returning a cleanup that clears the timeout:

```typescript
const id = setTimeout(() => setPriorDataLoaded(true), 0)
return () => clearTimeout(id)
```

**Files changed:** `src/pages/SessionPageCore.tsx`

---

## INC-013 — 2026-03-11 — ESLint `react-hooks/refs` — ref `.current` read during render (#325 wiring)

**Severity:** Low — build blocked until resolved
**Detected:** TypeScript/lint gate during Phase 22 implementation
**Fixed:** This session

**Root cause:** `pendingTransitionFromRef.current` (a `useRef`) was read directly inside JSX to populate `<FormativeCheckIn fromState={...} toState={...} />`. The `react-hooks/refs` rule prohibits reading `.current` in render-time code.

**Fix:** Replaced `pendingTransitionFromRef` and a second similar ref with two parallel state variables `pendingFrom` / `pendingTo` that are set alongside the ref mutations in `handleTransition`. The ref `pendingTransitionRef` is retained for callback execution logic; state vars are used exclusively for rendering.

**Files changed:** `src/pages/SessionPageCore.tsx`

---

## INC-014 — 2026-03-11 — 406 on educator_profiles / parent_profiles fetch

**Severity:** Medium — console error on every educator/parent page load
**Detected:** Playwright QA — educator portal verification
**Fixed:** Commit `441458f`

**Root cause:** `useEducatorProfile` and `useParentProfile` used `.single()` which always issues a 406 HTTP response when no row is found, even though the PGRST116 error code was being caught and silenced. The 406 appeared as a network error in the browser console.

**Fix:** Changed `.single()` to `.maybeSingle()`. Returns `null` with no error when no row exists; no HTTP error is emitted.

**Files changed:** `src/hooks/useEducatorProfile.ts`, `src/hooks/useParentProfile.ts`

---

## INC-015 — 2026-03-11 — 400 on courses query with '**none**' sentinel

**Severity:** Medium — educator and parent components fail to load course data when no progress exists yet
**Detected:** Playwright QA — educator dashboard, parent progress reports
**Fixed:** Commit `441458f`

**Root cause:** Three components guarded empty `courseIds` arrays with `.in('id', ['__none__'])` as a no-match sentinel. PostgREST rejects `__none__` with a 400 because `courses.id` is a UUID column and `__none__` is not a valid UUID.

**Fix:** Replaced `'__none__'` with the nil UUID `'00000000-0000-0000-0000-000000000000'`, which is a valid UUID that matches no real records.

**Files changed:** `src/components/educator/StudentProgressTable.tsx`, `src/components/parent/ParentProgressReports.tsx`, `src/components/educator/EducatorAnalytics.tsx`

---

## INC-016 — 2026-03-11 — ANTHROPIC_API_KEY absent from Supabase secrets

**Severity:** Critical — Amara agent (all 5 agents) non-functional; every agent-invoke call returned ERR_FAILED
**Detected:** Playwright QA — RACA session agent invocation
**Fixed:** This session (no code change — secret set via CLI)

**Root cause:** The `agent-invoke` Edge Function requires `ANTHROPIC_API_KEY` to call the Claude API. The key was never set in Supabase production secrets. All agent calls failed silently from the learner's perspective (agent panel showed error alert).

**Fix:** `supabase secrets set ANTHROPIC_API_KEY=<key>` run against the production project.

**Files changed:** None (Supabase secret configuration only)

---

## INC-017 — 2026-03-12 — Educator student detail page: three RLS gaps + two schema bugs

**Severity:** High — educator portal non-functional; student names, session history, and TRACE data all blank
**Detected:** Playwright QA after seed-e2e.ts fix (#343)
**Fixed:** This session — migration 059 + EducatorStudentDetailPage.tsx fixes

**Root cause (three issues):**

1. `profiles`, `cognitive_sessions`, and `epistemic_profiles` tables only had `auth.uid() = user_id` SELECT policies. Educators querying a student's rows received empty results because auth.uid() is the educator's UID, not the student's.
2. `EducatorStudentDetailPage.tsx` queried `cognitive_sessions` with `created_at` (column doesn't exist — actual column is `started_at`), causing a 400 Bad Request.
3. Same file queried `adaptive_learning_state` for per-lesson mastery data, but `lesson_id` and `mastery_status` columns don't exist on that table — they live on `lesson_progress`.

**Fix:**

- Migration `059_educator_rls_student_read.sql`: added educator SELECT policies on `profiles`, `cognitive_sessions`, and `epistemic_profiles`. Each policy authorises via either an `educator_student_links` row or a `class_enrollments → classes` join.
- `EducatorStudentDetailPage.tsx`: replaced `created_at` → `started_at` in select and order clauses; replaced `adaptive_learning_state` → `lesson_progress` with `score` in place of `mastery_score_float`.

**Files changed:** `supabase/migrations/059_educator_rls_student_read.sql`, `src/pages/EducatorStudentDetailPage.tsx`

---

---

## INC-018 — 2026-03-12 — Bugs #345–#348: font 404, regulation_checkins constraint, skill_evidence insert, raca_artifacts/epistemic_profiles not persisted

**Severity:** High — font accessibility broken; regulation and skill evidence writes failing; profile cognitive growth section always empty
**Detected:** Playwright E2E session + code audit
**Fixed:** This session

**Root cause (5 bugs):**

1. **#345 — OpenDyslexic font 404**: `@font-face` URL used wrong jsDelivr package name (`open-dyslexic@1.0.3`). Corrected to GitHub-hosted CDN path `gh/antijingoist/opendyslexic@master/compiled/OpenDyslexic-Regular.otf`.

2. **#347a — `regulation_checkins` INSERT constraint violation**: Original CHECK constraint only allowed `'ready'|'distracted'|'struggling'`. `FormativeCheckIn` (used at POSITION→PLAN, PLAN→APPLY, REVISE→DEFEND) inserts `'confident'|'unsure'|'need_more_time'`. Migration 060 expanded the constraint to cover both value sets.

3. **#347b — `skill_evidence_events` INSERT failure**: `saveSkillEvidence()` included `artifact_id` field which doesn't exist on the table. Removed the column from the insert.

4. **#348a — `raca_artifacts` count always 0**: No DB persist code existed — artifacts were dispatched only to the in-memory runtime store. Added `supabase.from('raca_artifacts').insert(...)` in `SessionPageCore.tsx`'s `saveArtifact` callback.

5. **#348b — `epistemic_profiles` (Cognitive Growth) always empty**: `epistemic-analyze` edge function was never called from the frontend. Added fire-and-forget fetch call in `handleEndSession` after session completes.

6. **`useSessionDiagnostic.ts` 400+406 errors**: `adaptive_learning_state` was queried with `.eq('lesson_id', lessonId)` — that column doesn't exist (table is course-scoped). Fixed by removing the `lesson_id` filter and using `.order('updated_at').limit(1)`. Both queries used `.single()` which returns 406 when no row exists; changed both to `.maybeSingle()`.

**Files changed:**

- `src/styles/index.css` — font URL
- `supabase/migrations/060_regulation_checkins_expand_check.sql` — constraint expansion (applied)
- `src/lib/intelligence/skill-evidence-extractor.ts` — removed `artifact_id` from insert
- `src/pages/SessionPageCore.tsx` — raca_artifacts persist + epistemic-analyze call + lesson_progress query fix
- `src/hooks/useSessionDiagnostic.ts` — removed `lesson_id` filter, `.order+.limit(1)`, `.maybeSingle()` both queries
