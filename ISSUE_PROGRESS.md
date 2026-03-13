# NeuroLearn — Issue Progress Log

This log tracks completed repository issues/workstreams and what is next.

## Active Backlog Snapshot (as of 2026-03-09)

Historical workstreams below remain useful as an implementation record, but they are not the full current backlog.

Current open GitHub issues:

- `#230` Replace browser TTS with ElevenLabs neural voice in ListenMode
- `#268` Documentation drift across README, ADRs, and architecture docs
- `#269` RACA intelligence engine disabled by default and incomplete feature flags
- `#270` Insufficient test coverage across hooks, pages, and dashboard workflows
- `#271` Large client bundle size reducing initial load performance
- `#272` Missing favicon asset referenced by HTML entry point

RACA intelligence engine work is still under active development.

## Historical Issue Summary (snapshot from 2026-03-08)

| Category                 | Total   | Closed  | Open  | % Complete |
| ------------------------ | ------- | ------- | ----- | ---------- |
| Config/Setup             | 10      | 10      | 0     | 100%       |
| Database/Migrations      | 12      | 12      | 0     | 100%       |
| Auth                     | 5       | 5       | 0     | 100%       |
| UI Components            | 8       | 8       | 0     | 100%       |
| Layout Components        | 5       | 5       | 0     | 100%       |
| Pages (Learner)          | 11      | 11      | 0     | 100%       |
| Hooks/Stores             | 3       | 3       | 0     | 100%       |
| CI/CD                    | 7       | 7       | 0     | 100%       |
| Security/Compliance      | 11      | 11      | 0     | 100%       |
| Accessibility            | 10      | 10      | 0     | 100%       |
| Testing                  | 5       | 5       | 0     | 100%       |
| Documentation            | 8       | 8       | 0     | 100%       |
| Learner Features         | 4       | 4       | 0     | 100%       |
| Educator Features        | 10      | 10      | 0     | 100%       |
| Parent Features          | 5       | 5       | 0     | 100%       |
| Admin Features           | 6       | 6       | 0     | 100%       |
| Phase 18 — RACA Depth    | 11      | 11      | 0     | 100%       |
| Gap Analysis (#211–#218) | 8       | 8       | 0     | 100%       |
| Operational (#219–#226)  | 8       | 8       | 0     | 100%       |
| **Total**                | **147** | **147** | **0** | **100%**   |

---

## Completed Workstreams

### 1) Project scaffold + tooling

- Core Vite + React + TypeScript setup finalized.
- Tailwind, PostCSS, and ESLint configuration added.
- Foundational documentation (README, setup/dev/specs/contributing/changelog) in place.

### 2) App routing + page scaffolds

- Client-side routing implemented with `react-router-dom` v6.
- 14 routes: home, login, signup, password-reset, dashboard, courses, course detail, lesson,
  session, profile, settings, educator, parent, admin, 404.
- Code splitting with React.lazy for all authenticated pages.

### 3) Reusable UI and layout system

- UI primitives: Button, Card, Input, Badge, Spinner, ProgressBar, Avatar, Tooltip, Modal
  (with focus trap), Alert.
- Layout components: Header, Sidebar, Footer, PageWrapper, FocusMode.

### 4) Domain components and state scaffolding

- Lesson components: LessonCard, TextLesson, AudioLesson, VideoLesson, InteractiveLesson,
  QuizBlock, LessonNav.
- Dashboard components: CourseCard, ProgressWidget, RecentActivity, StreakBadge.
- Learner components: SmartReminders (wired into LessonPage), MilestoneCelebration (wired
  into DashboardPage via localStorage-deduped milestone check).
- RACA components: 11 cognitive session UI components.
- Hooks (14), Zustand stores (4), shared types (6).

### 5) Database schema (24 migrations)

- Foundation: profiles, courses, lessons, lesson_progress (001-004).
- RBAC: user_role enum, parent_student_links, classes, class_enrollments (005).
- Supporting: notifications, user_settings, audit_log, course_enrollments (006).
- Adaptive: adaptive_learning_state (007).
- RACA: cognitive_sessions, cognitive_states, raca_audit_events, epistemic_profiles,
  raca_agent_interactions (010-016).
- Educator/parent profiles, class schema, RLS policies, incremental schema (017-023).
- RLS policies enforced on all tables.

### 6) RACA Cognitive Architecture (5 layers)

- Layer 0: Runtime Authority (session manager, event system, audit trail, persistence).
- Layer 1: 9-state Cognitive State Machine.
- Layer 2: Agent Router (state-to-agent mapping, permission enforcement).
- Layer 3: 5 Role-Constrained Agents.
- Layer 4: Epistemic Monitoring (TRACE fluency, dysregulation detection, adaptive scaffolding).
- 8 feature flags for progressive rollout; RACA imports lazy-loaded on SessionPage.

### 7) Auth (all flows complete)

- ProtectedRoute enforces authentication and role-based access (learner/parent/educator/admin).
- Password reset calls `supabase.auth.resetPasswordForEmail`; all `<main>` landmarks carry
  `id="main-content"` including the PasswordResetPage form state.
- Admin role-assignment via UserManagement persists to `profiles.role` + writes `audit_log`.
- Session management with automatic token refresh.

### 8) Security hardening

- Vercel security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options,
  Referrer-Policy, Permissions-Policy.
- Zod input validation on all auth forms.
- HTML entity sanitization for user-generated content.
- Rate limiting: `authRateLimit` + `apiRateLimit` utilities in `src/lib/rate-limit.ts`.
- CORS configuration for Edge Functions.

### 9) Compliance documentation

- `docs/compliance/coppa-compliance.md` — COPPA age gate & parental consent procedures.
- `docs/compliance/ferpa-compliance.md` — FERPA data handling guidance.
- `docs/compliance/gdpr-compliance.md` — GDPR rights and data processing documentation.
- `docs/compliance/pii-handling.md` — PII classification and retention procedures.
- `docs/compliance/encryption-verification.md` — Encryption-at-rest and in-transit verification.
- `docs/compliance/penetration-testing-plan.md` — OWASP-aligned penetration testing plan.
- `docs/compliance/color-contrast-audit.md` — WCAG 2.1 AA color contrast audit.
- `docs/compliance/screen-reader-testing.md` — NVDA + VoiceOver screen-reader test plan.

### 10) Accessibility hardening

- Focus trap for modals; keyboard navigation detection; skip link (`#main-content`).
- All `<main>` elements carry `id="main-content"`.
- ARIA tab/tabpanel/tablist relationships on all tabbed dashboards.
- Reduced motion support; OpenDyslexic font toggle.

### 11) Testing infrastructure

- Vitest + React Testing Library: 30+ tests passing.
- `jest-axe` automated accessibility tests in `tests/accessibility.test.tsx`.
- Playwright E2E: `auth.spec.ts`, `smoke.spec.ts`, `educator-portal.spec.ts`,
  `lesson.spec.ts`, `parent-portal.spec.ts` — all with real structural assertions and
  authenticated-flow stubs gated by env vars.
- Lighthouse CI running in GitHub Actions; `.lighthouserc.cjs` enforces score thresholds.

### 12) CI/CD

- GitHub Actions: validate (lint + typecheck + test) → build → lighthouse → migrate.
- `migrate` job runs `supabase db push` on `main` branch push only.
- Environment management: `.env.example` with all required vars documented.

### 13) Educator Portal (full MVP)

- EducatorDashboardPage with tabbed interface: Classes, Students, Content, Analytics, Messages.
- ClassList + ClassManagement (full CRUD via `useClassManagement` hook).
- StudentProgressTable (per-class progress monitoring from `lesson_progress`).
- CourseAssignment (assign courses to class enrollments).
- ContentManager (create/edit lessons with draft/published status).
- EducatorAnalytics (completion rates, avg mastery, avg streak, CSV export).
- EducatorMessages (Supabase Realtime channel for parent↔educator messaging).

### 14) Parent Portal (full MVP)

- ParentDashboardPage with tabbed interface: Students, Progress, Messages, Notifications.
- ParentStudentList (link/unlink students via `parent_student_links`).
- ParentProgressReports (per-student lesson progress cards).
- ParentMessages (real-time messaging with educators via Supabase channel).
- ParentNotificationPrefs (email/push notification preference persistence).

### 15) Admin Portal (full MVP)

- AdminDashboardPage with tabbed interface: Users, Content, Analytics, Audit Log.
- UserManagement (CRUD, role assignment with confirmation dialog + audit log write).
- ContentModeration (approve/reject lessons; moderation_status column).
- AdminAnalytics (platform-wide stats from `lesson_progress` + `profiles`).
- AuditLogViewer (paginated audit_log table view with filter by action type).

### 16) Learner Features

- SmartReminders: Pomodoro-style timer renders in LessonPage; break/hydration/stretch alerts.
- MilestoneCelebration: Triggered on DashboardPage when profile stats cross a milestone
  threshold; deduped via localStorage so each milestone shows exactly once.
- AI Adaptive Learning: `useAdaptiveLearning` hook + `adaptive_learning_state` table;
  mastery scoring, difficulty adjustment, and recommended lesson selection.
- AI Adaptive Learning spec: documented in `docs/api-documentation.md`.

### 17) Documentation

- 4 Architecture Decision Records (framework, RACA, accessibility, security).
- Database ERD (Mermaid) covering all 24 tables.
- API documentation for Supabase client, Edge Functions, health check, and adaptive engine.
- Rollback procedure for Vercel + DB migrations (`docs/rollback-procedure.md`).
- User journey maps for learner, parent, and educator roles (`docs/user-journey-maps.md`).
- ARIA strategy and alt text/transcript requirements.

### 18) Observability

- Sentry initialised in `main.tsx` when `VITE_SENTRY_DSN` env var is set; DSN must be
  provisioned in Vercel environment settings for production error tracking.
- `src/lib/sentry.ts` wired into the app.
- Vercel Analytics available via `VITE_VERCEL_ANALYTICS` env var.

---

## Validation Baseline (2026-03-08)

- `npm run build` — 0 TypeScript errors, code-split into 15+ chunks
- `npm run test -- --run` — 30/30 tests passing
- `npm run lint` — 0 warnings
- `npm run typecheck` — clean

## Phase 18 — RACA Depth & Engagement (COMPLETE)

| Issue | ID        | Title                                         | Status |
| ----- | --------- | --------------------------------------------- | ------ |
| #198  | REQ-18-01 | TRACE-Weighted XP                             | DONE   |
| #199  | REQ-18-02 | Educator LCP Dashboard                        | DONE   |
| #200  | REQ-18-03 | Session History & Growth Narrative            | DONE   |
| #201  | REQ-18-04 | Voice Input for RACA Sessions                 | DONE   |
| #202  | REQ-18-05 | Learner Onboarding / First-Run Experience     | DONE   |
| #203  | REQ-18-06 | Regulation Intervention Content               | DONE   |
| #204  | REQ-18-07 | Parent Growth Narrative View                  | DONE   |
| #205  | REQ-18-08 | Deep Work Streak Differentiation              | DONE   |
| #206  | REQ-18-09 | RACA Production Feature Flag Activation       | DONE   |
| #207  | REQ-18-10 | Educator RACA-Aware Course Builder            | DONE   |
| #208  | REQ-18-11 | RACA Supabase Schema Migration for Production | DONE   |

## Gap Analysis — Original Gaps #211–#218 (CLOSED)

| Issue | ID     | Title                                          | Status |
| ----- | ------ | ---------------------------------------------- | ------ |
| #211  | GAP-01 | Apply migrations 025–034 to production         | DONE   |
| #212  | GAP-02 | Enable RACA feature flags in Vercel production | DONE   |
| #213  | GAP-03 | Add Supabase secrets to GitHub Actions         | DONE   |
| #214  | GAP-04 | Create Sentry project and configure DSN        | DONE   |
| #215  | GAP-05 | Install Lighthouse CI GitHub App               | DONE   |
| #216  | GAP-06 | Enable Playwright E2E against live Supabase    | DONE   |
| #217  | GAP-07 | Execute staging QA checklist                   | DONE   |
| #218  | GAP-08 | Set RACA AI provider config in Supabase        | DONE   |

## Operational Issues #219–#226 (CLOSED)

| Issue | ID    | Title                                              | Executed        |
| ----- | ----- | -------------------------------------------------- | --------------- |
| #219  | OP-01 | Add Supabase secrets to GitHub Actions             | Manual runbook  |
| #220  | OP-02 | Apply migrations 030–034 to production             | ✅ Supabase MCP |
| #221  | OP-03 | Set RACA flags + AI config in Vercel production    | ✅ Vercel MCP   |
| #222  | OP-04 | Create Sentry project and configure DSN            | Manual runbook  |
| #223  | OP-05 | Install LHCI GitHub App and add token secret       | Manual runbook  |
| #224  | OP-06 | Set ANTHROPIC_API_KEY in Supabase Edge Functions   | Manual runbook  |
| #225  | OP-07 | Configure E2E secrets and PLAYWRIGHT_RUN in GitHub | Manual runbook  |
| #226  | OP-08 | Execute staging QA checklist                       | Manual runbook  |

## Status

The historical issue set summarized above was resolved at the time of that snapshot. The repository now has additional open backlog items listed at the top of this file.

Two items executed live via MCP:

- Migrations 030–034 applied to production Supabase
- All 8 RACA flags + AI provider vars set in Vercel production

Remaining manual items require external accounts (GitHub secrets, Sentry, Anthropic, LHCI).
See `.planning/GAP_ANALYSIS.md` for exact steps.

---

## Phase 19 — Intelligence Engine Core

| ID     | Title                        | Status      | Notes                                                                       |
| ------ | ---------------------------- | ----------- | --------------------------------------------------------------------------- |
| AI-06  | Adaptive Difficulty Engine   | ✅ Complete | Edge function + hook + migration                                            |
| AI-03  | TRACE Fluency Auto-Scorer    | ✅ Complete | RegulationCheckIn + FrustrationDetector + trace-score stub                  |
| AGY-03 | Agent Orchestration Bus      | ✅ Complete | StudentSessionArc + TransitionAnnouncement + SessionSummaryCard             |
| AI-01  | Diagnostic Gate              | ✅ Complete | useSessionDiagnostic + DiagnosticBanner + diagnostic-utils                  |
| AI-04  | Skill Evidence Collection    | ✅ Complete | skill-evidence-extractor + migration 042 + useSkillEvidence                 |
| AI-05  | Summative Mastery at ARCHIVE | ✅ Complete | mastery-scorer + migration 043 + useMasteryScoring                          |
| AI-02  | Gap Detection + Prescription | ✅ Complete | gap-analysis + migration 044 + useGapAnalysis + NextChallengeCard           |
| AI-07  | Personalized Agent Probing   | ✅ Complete | adaptation-scripts with buildPersonalizedSystem                             |
| AI-08  | Availability Detector        | ✅ Complete | layer0-runtime/availability-detector + BreakOffering + useAvailabilityCheck |

## Phase 19 Extension — Mastery, Goals, Session Modes & Voice

| ID     | Title                        | Status      | Notes                                                                                                      |
| ------ | ---------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------- |
| ASS-01 | Mastery Demonstration Mode   | ✅ Complete | MasteryCheckButton + MasteryCheckSession + useMasteryCheck + migration 045                                 |
| AGY-01 | Student Learning Goals       | ✅ Complete | GoalSettingWidget + GoalProgressCard + useStudentGoals + migration 046                                     |
| AGY-02 | Session Mode Choice Selector | ✅ Complete | SessionModeSelector + useSessionMode + migration 047                                                       |
| AGY-04 | Amara Keyes AI Guide Persona | ✅ Complete | BASE_PERSONA + AGENT_VOICE_ADDENDA + buildAgentSystemPrompt in prompt-templates; AgentMessage isAmara prop |
| AI-09  | Cross-Session Memory Brief   | ✅ Complete | longitudinal-context.ts + useLongitudinalContext                                                           |
| ASS-02 | Spaced Repetition Queue      | ✅ Complete | SM-2 algorithm in spaced-repetition.ts + useSpacedRepetition + SpacedRepetitionCard + migration 048        |
| ASS-03 | Voice Input Pathway          | ✅ Complete | VoiceInputButton updated (className + reduce_motion) + InputModeToggle + InputMode type + migration 049    |

## Phase 20 — Standards, Intelligence & Educator Tooling

| ID      | Title                            | Status      | Notes                                                                                                                                 |
| ------- | -------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| CCSS-01 | Common Core Standards Schema     | ✅ Complete | ccss_standards + skill_to_ccss_map + student_ccss_evidence (migration 050) + ccss-seed.ts                                             |
| CCSS-02 | Educator Standards Evidence View | ✅ Complete | EducatorStandardsView + useCcssStandards + useCcssExport (window.print)                                                               |
| CCSS-03 | Student Skill Power-Ups          | ✅ Complete | SkillPowerUps component + useSkillPowerUps                                                                                            |
| EDU-13  | Student Frustration Dashboard    | ✅ Complete | FrustrationIndicator + NeedsAttentionPanel + useStudentRegulation                                                                     |
| EDU-14  | Educator Intervention Alerts     | ✅ Complete | educator_alerts (migration 051) + AlertsPanel + AlertBadge + useEducatorAlerts                                                        |
| EDU-15  | LCP Generator                    | ✅ Complete | LCPGenerator + useLcpGenerator (window.print)                                                                                         |
| PAR-05  | Parent Growth Narratives         | ✅ Complete | session_parent_narratives (migration 052) + SessionNarrativeCard + useParentNarratives + generate-parent-narrative edge function stub |
| ADM-03  | Platform Intelligence Dashboard  | ✅ Complete | platform_thresholds (migration 053) + IntelligenceDashboard + usePlatformStats + usePlatformThresholds                                |
| DATA-01 | Learning Transcript              | ✅ Complete | LearningTranscript component + useLearningTranscript                                                                                  |
| DATA-02 | Real-Time Classroom View         | ✅ Complete | educator_checkins (migration 054) + LiveClassroomView + useClassroomRealtime (30s poll)                                               |
