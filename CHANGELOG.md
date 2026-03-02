# Changelog

All notable changes to NeuroLearn are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **Gap Analysis Fixes (2026-03-02):**
  - React.lazy code splitting for all authenticated pages (13 chunks)
  - Zod v4 input validation schemas (signIn, signUp, passwordReset, profile, settings)
  - HTML entity sanitization and input sanitization utilities
  - Vercel security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
  - Password reset page and flow (`/reset-password`)
  - Session management with automatic token refresh (5 min before expiry)
  - Modal focus trap with keyboard escape and previous element restoration
  - Keyboard navigation detection (Tab vs mouse) with focus outline toggling
  - Skip link for main content navigation
  - Reduced motion support (OS `prefers-reduced-motion` + app setting)
  - Dyslexia-friendly font toggle (OpenDyslexic via CDN)
  - Logger utility with levels and module scoping (`src/lib/logger.ts`)
  - CORS configuration helper for Edge Functions
  - Health check endpoint at `/health.json`
  - Supabase client mock for unit testing
  - Test data factory functions (course, lesson, profile, progress)
  - 18 new validation and test-utils tests (24 total)
  - DB migration 005: RBAC schema (user_role enum, parent_student_links, classes, class_enrollments)
  - DB migration 006: Supporting tables (notifications, user_settings, audit_log, course_enrollments)
  - DB migration 007: Adaptive learning state table
  - 4 Architecture Decision Records (framework, RACA, accessibility, security)
  - Database ERD diagram (Mermaid, 16 tables)
  - API documentation (Supabase client, Edge Functions, health check)
  - Rollback procedure (Vercel + DB migrations)
  - ARIA roles and attributes strategy
  - Alt text and media transcript requirements

- **RACA Architecture (2026-03-02):**
  - Full 5-layer agentic cognitive architecture (93 files)
  - Layer 0: Runtime Authority (session manager, events, audit, persistence)
  - Layer 1: 9-state Cognitive State Machine (ROOT through ARCHIVE)
  - Layer 2: Agent Router (state-to-agent mapping, permission enforcement)
  - Layer 3: 5 Role-Constrained Agents (framing, research, construction, critique, defense)
  - Layer 4: Epistemic Monitoring (TRACE fluency, dysregulation detection, adaptation)
  - 11 RACA UI components and SessionPage
  - 8 feature flags for progressive rollout
  - 3 Supabase Edge Functions (agent-invoke, session-sync, epistemic-analyze)
  - 5 RACA database migrations (010-016)

- **Foundation (2026-03-02):**
  - GitHub Actions CI workflow (test/lint/build gates)
  - Supabase-backed data access with local fallback
  - Auth store with signIn/signUp/signOut and session recovery
  - Auth UX with loading states and error handling
  - Complete application scaffold with 12 routed pages
  - 10 UI components, 5 layout components, 7 lesson components, 4 dashboard components
  - 15 custom hooks, 4 Zustand stores, 6 type definition modules
  - Supabase schema (4 foundation + 7 RACA + 3 supporting = 14 migrations)

### Changed
- LoginPage and SignUpPage wired to Supabase auth with Zod validation
- Modal component upgraded with focus trap and ARIA attributes
- App.tsx refactored for React.lazy code splitting
- main.tsx updated with skip link for keyboard accessibility
- index.css extended with sr-only, skip-link, keyboard-nav, and reduced-motion CSS

### Validation
- `npm run build` — 0 TypeScript errors, 13-chunk code-split build
- `npm run test -- --run` — 24/24 tests passing
- `npm run lint` — 0 warnings

---

## [0.1.0] — 2026-03-02

### Added
- Initial repository created with basic README
- GitHub Actions CI workflow for test/lint/build gates
- Initial accessibility hardening for modal and navigation
- Supabase-backed data access in hooks

[Unreleased]: https://github.com/SAHearn1/neurolearn/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/SAHearn1/neurolearn/releases/tag/v0.1.0
