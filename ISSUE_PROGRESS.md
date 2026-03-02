# NeuroLearn — Issue Progress Log

This log tracks completed repository issues/workstreams and what is next.

## Completed Workstreams

### 1) Project scaffold + tooling
- Core Vite + React + TypeScript setup finalized.
- Tailwind, PostCSS, and ESLint configuration added.
- Foundational documentation (`README`, setup/dev/specs/contributing/changelog) in place.

### 2) App routing + page scaffolds
- Client-side routing implemented with `react-router-dom`.
- Route coverage includes home, auth, dashboard, courses, course detail, lesson detail, profile, settings, and 404.
- Nested app-shell behavior applied through layout wrapper components.

### 3) Reusable UI and layout system
- UI primitives completed (`Button`, `Card`, `Input`, `Badge`, `Spinner`, `ProgressBar`, `Avatar`, `Tooltip`, `Modal`, `Alert`).
- Layout components completed (`Header`, `Sidebar`, `Footer`, `PageWrapper`, `FocusMode`).

### 4) Domain components and state scaffolding
- Lesson component set completed (`LessonCard`, `TextLesson`, `AudioLesson`, `VideoLesson`, `InteractiveLesson`, `QuizBlock`, `LessonNav`).
- Dashboard component set completed (`CourseCard`, `ProgressWidget`, `RecentActivity`, `StreakBadge`).
- Hooks, Zustand stores, and shared types scaffolded.

### 5) Supabase scaffold
- Supabase config, schema migrations, and seed script created.
- Client/server helper placeholders added for future integration.

### 6) Baseline validation
- Unit tests added for utility and store behavior.
- Standard validation commands currently passing:
  - `npm run test -- --run`
  - `npm run lint`
  - `npm run build`

## Status Snapshot
- Date: 2026-03-02 (UTC)
- `FILE_CHECKLIST.md`: **83 / 83 files complete**
- Validation baseline: tests + lint + build passing locally

## Recently Completed
- Added baseline unit tests for utility and Zustand stores.
- Added `ISSUE_PROGRESS.md` and linked it from project documentation.
- Updated changelog/developer docs to reflect current scaffold and validation flow.
- Replaced course/lesson/progress hooks with Supabase-backed data access plus local fallback behavior.
- Implemented Supabase session-aware auth hook methods (`signIn`, `signUp`, `signOut`) with store synchronization.
- Added user-facing auth error handling and loading states on login/sign-up flows.
- Applied initial accessibility hardening for modal keyboard/escape behavior, active navigation states, and tooltip/quiz semantics.
- Attempted routed-flow jsdom tests but environment policy blocked installing `jsdom`; deferred until dependency access is available.
- Added CI workflow to enforce test/lint/build gates on pushes and pull requests.
- Replaced key static page placeholders with hook-driven data on dashboard/courses/course/lesson pages.
- Expanded auth UX with password-reset trigger and verification-email resend states/messages.
- Added skip-link/main landmark support and keyboard focus trapping in modal dialogs.
- Deepened live data coverage for profile/settings experiences using hooks/store-backed state.
- Added auth account-management support with in-app password update flow in Settings.
- Added settings persistence flow with Supabase upsert + local-session fallback messaging.

## Current Completion Status
- `FILE_CHECKLIST.md`: **83 / 83 files complete**.

## Next Execution Plan
1. Expand routed-flow tests to cover dashboard/course/lesson transitions.
2. Add jsdom-backed component tests once dependency policy allows installation.
3. Continue accessibility hardening with screen-reader walkthrough audits.
4. Persist profile updates (display name/learning style) back to Supabase.
5. Add additional account-management flows (session history / device management when supported).

