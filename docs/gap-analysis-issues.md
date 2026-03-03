# NeuroLearn — Smoke Test Gap Analysis & Issue Backlog

_Generated: 2026-03-02 | Branch: claude/smoke-test-gap-analysis-QRpDa_

## Executive Summary

Comprehensive smoke test performed across all 14 routes and 4 user roles. Build passes, 30/30 unit tests pass, lint clean. Six code-level defects patched in this analysis run. Remaining 14 issues filed below in priority order.

---

## Issues Fixed in This Analysis Run

| #      | Title                                                                               | Severity | Status   |
| ------ | ----------------------------------------------------------------------------------- | -------- | -------- |
| FIX-1  | Vitest test suites crash due to Supabase client throwing on missing env vars        | Critical | ✅ Fixed |
| FIX-2  | Missing auth guard — all authenticated routes accessible without login              | Critical | ✅ Fixed |
| FIX-3  | DashboardPage uses hardcoded course data instead of real `useCourses` hook          | High     | ✅ Fixed |
| FIX-4  | DashboardPage shows "Welcome back, learner" instead of real user display name       | High     | ✅ Fixed |
| FIX-5  | CoursesPage uses hardcoded course array instead of real `useCourses` hook           | High     | ✅ Fixed |
| FIX-6  | CoursePage uses hardcoded lesson array instead of real `useLessons` hook            | High     | ✅ Fixed |
| FIX-7  | LessonPage is a placeholder stub — no real lesson content rendered                  | High     | ✅ Fixed |
| FIX-8  | EducatorDashboardPage welcome message bug: `profile?.bio ? 'Educator' : 'Educator'` | Medium   | ✅ Fixed |
| FIX-9  | AdminDashboardPage stats query uses `.eq('completed', true)` (wrong column name)    | High     | ✅ Fixed |
| FIX-10 | Playwright `testDir` points to `./tests/e2e` but smoke spec was in `./e2e/`         | Medium   | ✅ Fixed |

---

## Remaining Issues (Open Backlog)

### ISSUE-001: Role-Based Route Guards — Educator/Parent/Admin Pages

**Priority:** P0 — Critical
**Category:** Auth / Security
**Role:** All

**Description:**
`ProtectedRoute` now enforces authentication, but does not enforce role-based access. A user with `role = 'learner'` can successfully navigate to `/admin`, `/educator`, and `/parent` after logging in. The role check must happen at the route level before page components load.

**Acceptance Criteria:**

- `/admin` redirects non-admin users to `/dashboard` with a clear error message
- `/educator` redirects non-educator users to `/dashboard`
- `/parent` redirects non-parent users to `/dashboard`
- Admin users can access all role dashboards
- Role is read from the `profiles.role` column via a lightweight `useUserRole` hook

**Implementation Notes:**

- Add `useUserRole` hook that reads `role` from `profiles` table for the current user
- Extend `ProtectedRoute` to accept `requiredRole?: 'learner' | 'parent' | 'educator' | 'admin'`
- Wire role checks in `App.tsx` for `/educator`, `/parent`, `/admin` routes

---

### ISSUE-002: Password Reset Flow Incomplete

**Priority:** P0 — Critical
**Category:** Auth
**Role:** All

**Description:**
`PasswordResetPage` exists but the Supabase `resetPasswordForEmail` call is not implemented. The page renders a form but submitting it does nothing (or errors silently). E2E test `auth.spec.ts` checks `/password-reset` but the route is `/reset-password` (path mismatch).

**Acceptance Criteria:**

- Submitting the password reset form calls `supabase.auth.resetPasswordForEmail(email)`
- Success shows a confirmation message ("Check your email for a reset link")
- Error states are displayed to the user
- E2E route check updated to `/reset-password`

---

### ISSUE-003: ARIA Tab Panel Relationships Incomplete

**Priority:** P1 — High
**Category:** Accessibility
**Role:** Educator, Parent, Admin

**Description:**
The tabbed dashboards (Educator, Parent, Admin) use `role="tab"` buttons but the tab panels lack `role="tabpanel"`, `aria-labelledby`, and `id` attributes, and the `<nav>` element wrapping tabs should be `role="tablist"`. Screen readers cannot correctly announce the active tab or navigate between panels.

**Acceptance Criteria:**

- Each tab `<button>` has a unique `id` and `aria-controls="panel-{key}"`
- Each tab panel section has `role="tabpanel"`, `id="panel-{key}"`, `aria-labelledby="tab-{key}"`
- Inactive tab panels are hidden from screen readers with `hidden` attribute or `aria-hidden="true"`
- WCAG 2.1 SC 4.1.2 (Name, Role, Value) passes

---

### ISSUE-004: Sentry DSN Not Configured — Error Tracking Inactive

**Priority:** P1 — High
**Category:** Observability
**Role:** All (ops)

**Description:**
`VITE_SENTRY_DSN` is empty in `.env.example` and Sentry is initialized in `main.tsx` only when the DSN is set. Production deployments have no error tracking. The `src/lib/sentry.ts` module is orphaned scaffolding that's never imported or used.

**Acceptance Criteria:**

- `VITE_SENTRY_DSN` populated in Vercel environment variables for production
- `src/lib/sentry.ts` either wired in or removed to avoid dead code
- Sentry alert rules configured for: unhandled errors, Supabase auth failures, RACA agent errors

---

### ISSUE-005: LessonPage — Interactive and Quiz Lesson Type Rendering

**Priority:** P1 — High
**Category:** Learner Experience
**Role:** Learner

**Description:**
`LessonPage` now renders `text`, `video`, and `audio` lesson types via their respective components. However `interactive` and `quiz` lesson types show a placeholder message. `QuizBlock` and `InteractiveLesson` components exist and are ready but need to be wired in with the lesson's `content` field parsed appropriately.

**Acceptance Criteria:**

- `quiz` lessons render `QuizBlock` with `prompt` and `answer` parsed from JSON `content` field
- `interactive` lessons render `InteractiveLesson` with `instructions` from content
- Content format documented in `docs/api-documentation.md`
- Unit tests added for quiz answer checking logic

---

### ISSUE-006: Missing `id="main-content"` Target on Remaining Pages

**Priority:** P1 — High
**Category:** Accessibility
**Role:** All

**Description:**
The skip link (`<a href="#main-content">`) in `main.tsx` requires a matching `id="main-content"` on each page's `<main>` element. The following pages are missing this target:

- `EducatorDashboardPage` (`<main>` has no `id`)
- `ParentDashboardPage` (`<main>` has no `id`)
- `AdminDashboardPage` (`<main>` has no `id`)
- `LoginPage` (`<main>` has no `id`)
- `SignUpPage` (`<main>` has no `id`)
- `PasswordResetPage` (`<main>` has no `id`)
- `ProfilePage` (`<main>` has no `id`)
- `SettingsPage` (`<main>` has no `id`)
- `SessionPage` (check needed)

**Acceptance Criteria:**

- All `<main>` elements have `id="main-content"`
- Skip link navigation tested with keyboard

---

### ISSUE-007: Supabase Migrations 009–023 Not Present on Disk

**Priority:** P1 — High
**Category:** Database / Deployment
**Role:** All (ops)

**Description:**
The local `supabase/migrations/` directory is missing migrations 009–023 (educator profiles, parent profiles, cognitive sessions, audit events, epistemic profiles, agent interactions, RLS policies, and all incremental schema changes). These exist in the production DB but cannot be run locally or in CI, making local development and migration testing impossible.

**Acceptance Criteria:**

- All 24 migrations present in `supabase/migrations/`
- Migration files numbered sequentially with no gaps
- `supabase db reset` succeeds locally
- CI migration step documented in `.github/workflows/ci.yml`

**Note:** Do NOT apply backward-incompatible schema changes. Extract idempotent `CREATE TABLE IF NOT EXISTS` / `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` equivalents from production schema.

---

### ISSUE-008: Educator Portal — Content Manager (Create/Edit Lessons)

**Priority:** P2 — Medium
**Category:** Educator Features
**Role:** Educator

**Description:**
`ContentManager` component exists but needs to implement full CRUD for lesson creation/editing. Currently it likely fetches and displays lessons but may not have a functional create/edit form connected to the database.

**Acceptance Criteria:**

- Educators can create new lessons (title, type, content, duration)
- Educators can edit existing lesson content
- Lessons are saved to Supabase with `status = 'draft'` by default
- Content moderation status (`moderation_status`) respected
- Form validates required fields before submission

---

### ISSUE-009: Educator Portal — Analytics and CSV Export

**Priority:** P2 — Medium
**Category:** Educator Features
**Role:** Educator

**Description:**
`EducatorAnalytics` component exists but needs to surface real data: completion rates per course, average scores, time-on-task, and engagement trends. CSV export button expected by educators for reporting.

**Acceptance Criteria:**

- Analytics dashboard shows: total students, avg mastery score, lessons completed this week, top/bottom performing students
- Date range filter (last 7d, 30d, 90d)
- CSV export downloads a file with student progress data
- Data sourced from `lesson_progress` and `adaptive_learning_state` tables

---

### ISSUE-010: Parent Portal — Messaging System (Supabase Realtime)

**Priority:** P2 — Medium
**Category:** Parent Features
**Role:** Parent, Educator

**Description:**
`ParentMessages` component needs to implement real-time messaging between parents and educators using Supabase Realtime channels. Currently the component may be a stub or uses polling.

**Acceptance Criteria:**

- Messages stored in a `parent_educator_messages` table (or use existing `notifications` table)
- Real-time delivery via `supabase.channel()` subscription
- Message threads grouped by educator
- Unread message count badge in navigation
- Character limit and basic sanitization on input

---

### ISSUE-011: Learner — Progress Bar on Dashboard Shows 0%

**Priority:** P2 — Medium
**Category:** Learner Experience
**Role:** Learner

**Description:**
After the DashboardPage fix to use real course data, the `ProgressBar` shows `value={0}` for all courses. The actual progress percentage requires integrating `useProgress` hook per course to fetch real completion data from `lesson_progress`.

**Acceptance Criteria:**

- Dashboard course cards show real percent complete from `lesson_progress`
- Progress loads asynchronously without blocking the page render
- `useProgressStore.fetchCourseProgress(userId, courseId)` called per enrolled course
- Courses with no progress show 0%, not undefined

---

### ISSUE-012: Admin — Role Assignment UI

**Priority:** P2 — Medium
**Category:** Admin Features
**Role:** Admin

**Description:**
`UserManagement` component shows a role badge and filter, but the role-change dropdown may not actually persist to the `profiles` table. Admins need to be able to promote learners to educator/parent roles.

**Acceptance Criteria:**

- Admins can change a user's role from the dropdown in UserManagement
- Role change updates `profiles.role` via Supabase
- Change is logged to `audit_log` table
- Confirmation dialog prevents accidental role escalation

---

### ISSUE-013: CI/CD — Automate Database Migration Step

**Priority:** P2 — Medium
**Category:** CI/CD
**Role:** All (ops)

**Description:**
The GitHub Actions CI pipeline runs test/lint/build but does not apply database migrations. Vercel preview deployments may run against a DB that doesn't match the schema in `supabase/migrations/`.

**Acceptance Criteria:**

- CI pipeline runs `supabase db push` or equivalent against a staging Supabase project
- Migration failures block merge to `main`
- `SUPABASE_DB_URL` and `SUPABASE_SERVICE_ROLE_KEY` secrets added to GitHub repo settings
- Rollback procedure documented in `docs/rollback-procedure.md`

---

### ISSUE-014: Performance — Session Page Bundle Size (44KB gzip)

**Priority:** P3 — Low
**Category:** Performance
**Role:** Learner

**Description:**
`SessionPage` is the largest chunk at 44.46KB gzipped (the next largest is EducatorDashboard at 23KB). The RACA architecture (37 files) all loads together on session start. With RACA feature flags all off by default, most of this code is dead on first load.

**Acceptance Criteria:**

- RACA layer imports moved to dynamic `import()` calls gated by feature flags
- SessionPage initial load < 25KB gzip when all RACA flags are off
- Lighthouse performance score maintained ≥ 90

---

## Issue Priority Matrix

```
P0 Critical (block prod):   ISSUE-001, ISSUE-002
P1 High (block full UX):    ISSUE-003, ISSUE-004, ISSUE-005, ISSUE-006, ISSUE-007
P2 Medium (functional):     ISSUE-008, ISSUE-009, ISSUE-010, ISSUE-011, ISSUE-012, ISSUE-013
P3 Low (optimization):      ISSUE-014
```

## Recommended Execution Order

1. **Sprint 1** (P0): ISSUE-001 (role guards), ISSUE-002 (password reset)
2. **Sprint 2** (P1 Acc): ISSUE-003 (ARIA tabs), ISSUE-006 (skip link targets)
3. **Sprint 2** (P1 Infra): ISSUE-007 (migrations), ISSUE-004 (Sentry)
4. **Sprint 3** (P1 Feature): ISSUE-005 (quiz/interactive lessons), ISSUE-011 (real progress)
5. **Sprint 4** (P2 Features): ISSUE-008, ISSUE-009, ISSUE-010, ISSUE-012
6. **Sprint 5** (CI+Perf): ISSUE-013, ISSUE-014

---

_All issues confirmed against build state: `npm run build` ✅ | `npm test` 30/30 ✅ | `npm run lint` ✅_
