# Changelog

All notable changes to NeuroLearn are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- GitHub Actions CI workflow added to run test/lint/build on push and pull request.
- Initial accessibility hardening added for modal keyboard close/backdrop close, nav active state visibility, and tooltip/quiz semantics.
- Supabase-backed data access added in hooks for courses, lessons, progress, and auth session sync.
- Login and sign-up pages now use auth hook actions with loading/error UX feedback.
- Complete application scaffold with routed pages for home, auth, dashboard, courses, lessons, profile, settings, and not-found
- Reusable layout shell components (`Header`, `Sidebar`, `Footer`, `PageWrapper`, `FocusMode`)
- Reusable UI component library (`Button`, `Card`, `Input`, `Badge`, `Spinner`, `ProgressBar`, `Avatar`, `Tooltip`, `Modal`, `Alert`)
- Dashboard and lesson component modules with page integrations
- Initial hooks (`useAuth`, `useCourses`, `useLessons`, `useProgress`, `useProfile`, `useSettings`)
- Initial Zustand stores (`authStore`, `settingsStore`, `progressStore`)
- Shared domain types under `src/types`
- Supabase helper files (`utils/supabase/client.ts`, `utils/supabase/server.ts`) and generic helper utilities (`utils/helpers.ts`)
- Supabase scaffold (`config.toml`, migrations `001-004`, and `seed.sql`)
- Checklist completion updates showing all tracked scaffold files created

### Changed
- Status docs updated for sequential issue-completion progress and next execution queue refinement
- README updated with implementation status section and roadmap progress checkboxes
- Issue progress log added to document completed workstreams and next issue queue
- Status documentation refreshed with dated snapshot and next execution plan

### Validation
- `npm run test -- --run`
- `npm run lint`
- `npm run build`

---

## [0.1.0] — 2026-03-02

### Added
- GitHub Actions CI workflow added to run test/lint/build on push and pull request.
- Initial accessibility hardening added for modal keyboard close/backdrop close, nav active state visibility, and tooltip/quiz semantics.
- Supabase-backed data access added in hooks for courses, lessons, progress, and auth session sync.
- Login and sign-up pages now use auth hook actions with loading/error UX feedback.
- Initial repository created with basic README

[Unreleased]: https://github.com/SAHearn1/neurolearn/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/SAHearn1/neurolearn/releases/tag/v0.1.0
