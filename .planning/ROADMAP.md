# NeuroLearn — Roadmap & Requirements

Requirements are the atomic units plans reference. IDs map to GitHub issues.

## Phase 11 — Educator Portal

| ID        | Issue | Requirement                                                                |
| --------- | ----- | -------------------------------------------------------------------------- |
| REQ-11-01 | #66   | Educator profile schema (educator_profiles table, RLS, types)              |
| REQ-11-02 | #68   | Educator–student linking (educator_student_links table, RLS)               |
| REQ-11-03 | #70   | EducatorDashboardPage: real data, class overview, quick stats              |
| REQ-11-04 | #72   | Class management UI (ClassList, create/archive class, enroll students)     |
| REQ-11-05 | #75   | Student progress monitoring (StudentProgressTable with filtering/sort)     |
| REQ-11-06 | #77   | Course/lesson assignment (CourseAssignment component, assign to class)     |
| REQ-11-07 | #80   | Educator analytics (EducatorAnalytics: completion rates, time-on-task)     |
| REQ-11-08 | #83   | Content management (ContentManager: create/edit lessons, markdown support) |
| REQ-11-09 | #43   | Messaging system (Supabase Realtime, educator↔parent threads)              |

## Phase 12 — Parent Portal

| ID        | Issue | Requirement                                                            |
| --------- | ----- | ---------------------------------------------------------------------- |
| REQ-12-01 | #49   | Parent profile schema (parent_profiles table, RLS, types)              |
| REQ-12-02 | #53   | Parent–student linking (confirm/verify link flow)                      |
| REQ-12-03 | #54   | ParentDashboardPage: real data, child summary cards                    |
| REQ-12-04 | #56   | Progress report views (ParentProgressReports, weekly/monthly charts)   |
| REQ-12-05 | #59   | Notification preferences (ParentNotificationPrefs: email/push toggles) |
| REQ-12-06 | #61   | Parent–educator communication (ParentMessages, Realtime threads)       |

## Phase 13 — Admin Portal

| ID        | Issue | Requirement                                                               |
| --------- | ----- | ------------------------------------------------------------------------- |
| REQ-13-01 | #27   | Admin-only role assignment via dashboard                                  |
| REQ-13-02 | #86   | AdminDashboardPage: real data, platform health widgets                    |
| REQ-13-03 | #90   | User management (UserManagement: CRUD, role assignment, soft-delete)      |
| REQ-13-04 | #93   | Content moderation tools (ContentModeration: flag/approve/reject)         |
| REQ-13-05 | #95   | System analytics (SystemAnalytics: DAU, lesson completion, error rates)   |
| REQ-13-06 | #97   | Audit log viewer (AuditLogViewer: filter by user/action/date, export CSV) |

## Phase 14 — Security & Compliance

| ID        | Issue | Requirement                                                                         |
| --------- | ----- | ----------------------------------------------------------------------------------- |
| REQ-14-01 | #35   | Rate limiting (auth: 5 req/min, API: 100 req/min, edge-function middleware)         |
| REQ-14-02 | #44   | COPPA compliance (age gate <13, parental consent flow, data deletion)               |
| REQ-14-03 | #46   | FERPA compliance documentation (access controls, disclosure policy)                 |
| REQ-14-04 | #47   | GDPR compliance documentation (DPA, right-to-delete, data map)                      |
| REQ-14-05 | #48   | PII handling procedures (data classification, retention policy, pseudonymization)   |
| REQ-14-06 | #50   | Data encryption verification (at-rest AES-256, in-transit TLS 1.3, key rotation)    |
| REQ-14-07 | #51   | Penetration testing plan (OWASP Top 10 coverage, test methodology, remediation SLA) |
| REQ-14-08 | #64   | Color contrast compliance verification (4.5:1 minimum, audit report)                |

## Phase 15 — Testing

| ID        | Issue | Requirement                                                                       |
| --------- | ----- | --------------------------------------------------------------------------------- |
| REQ-15-01 | #39   | Playwright E2E: setup, auth flows, lesson completion, RACA session                |
| REQ-15-02 | #42   | jest-axe automated accessibility testing (all page components)                    |
| REQ-15-03 | #45   | Lighthouse CI performance testing (Performance ≥90, A11y ≥95, Best Practices ≥90) |
| REQ-15-04 | #67   | Screen reader testing documentation (NVDA + VoiceOver test scripts)               |

## Phase 16 — Learner Features

| ID        | Issue | Requirement                                                                            |
| --------- | ----- | -------------------------------------------------------------------------------------- |
| REQ-16-01 | #31   | Smart reminders (SmartReminders: session-based, Pomodoro-aware, ADHD-friendly)         |
| REQ-16-02 | #34   | AI adaptive learning specification (algorithm design doc, difficulty curve)            |
| REQ-16-03 | #37   | AI adaptive learning engine (useAdaptiveLearning implementation, difficulty routing)   |
| REQ-16-04 | #40   | Milestone celebrations (MilestoneCelebration: confetti, streak badges, reduced-motion) |

## Phase 17 — Observability & CI/CD

| ID        | Issue | Requirement                                                                      |
| --------- | ----- | -------------------------------------------------------------------------------- |
| REQ-17-01 | #98   | Sentry error tracking (DSN config, source maps, user context, session replay)    |
| REQ-17-02 | #100  | Vercel Analytics (Web Vitals, custom events for lesson completion + RACA)        |
| REQ-17-03 | #91   | Environment management (dev/staging/prod config, environment promotion workflow) |
| REQ-17-04 | #94   | Automated DB migrations in CI/CD (Supabase CLI migration step in ci.yml)         |
| REQ-17-05 | #113  | User journey maps (learner, parent, educator — Mermaid sequence diagrams)        |

## Phase 18 — RACA Depth & Engagement

| ID        | Issue | Requirement                                                                                    |
| --------- | ----- | ---------------------------------------------------------------------------------------------- |
| REQ-18-01 | #198  | TRACE-Weighted XP: scale XP reward by session TRACE overall score; surface multiplier in UI    |
| REQ-18-02 | #199  | Educator LCP Dashboard: per-student TRACE bars, trajectory badges, growth timeline view        |
| REQ-18-03 | #200  | Session History & Growth Narrative: timeline of past sessions + AI-generated growth summary    |
| REQ-18-04 | #201  | Voice Input for RACA session responses via Web Speech API                                      |
| REQ-18-05 | #202  | Learner Onboarding / First-Run Experience: goal selection, learning-style quiz, RACA intro     |
| REQ-18-06 | #203  | Regulation Intervention Content: library of co-regulation micro-activities for ROOT/REGULATE   |
| REQ-18-07 | #204  | Parent Growth Narrative View: read-only LCP summary + trajectory badge for parent portal       |
| REQ-18-08 | #205  | Deep Work Streak Differentiation: track consecutive RACA sessions separate from lesson streak  |
| REQ-18-09 | #206  | RACA Production Feature Flag Activation: enable all 8 flags for production rollout             |
| REQ-18-10 | #207  | Educator RACA-Aware Course Builder: RACA phase tags on lessons, prerequisite gating            |
| REQ-18-11 | #208  | RACA Supabase Schema Migration for Production: raca_artifacts, raca_agent_interactions indexes |

## Phase Dependency Graph

```
Phase 11 ──┐
Phase 12 ──┤
Phase 13 ──┘
           │
           ▼
Phase 14 (security — independent, can run in parallel with 11-13)
Phase 15 (testing — depends on 11-13 having real implementations)
Phase 16 (learner features — independent, can overlap with 11-13)
           │
           ▼
Phase 17 (observability — runs last, wraps everything)
```

## Wave Schedule

| Wave | Plans                      | Status | Can run in parallel                      |
| ---- | -------------------------- | ------ | ---------------------------------------- |
| 1    | 11-01, 12-01, 14-01        | DONE   | Yes — all schema/infra, no UI deps       |
| 2    | 11-02, 12-02, 13-01, 16-01 | DONE   | Yes — UI depends on wave 1 schemas       |
| 3    | 11-03, 12-03, 13-02, 16-02 | DONE   | Yes — analytics/content/compliance       |
| 4    | 14-02, 15-01, 16-03        | DONE   | Yes — compliance docs + E2E + AI engine  |
| 5    | 15-02, 15-03, 17-01, 17-02 | DONE   | Yes — test coverage + observability      |
| 6    | 17-03, 17-04, 17-05        | DONE   | Yes — CI/CD, env, docs cleanup           |
| 7    | 18-09, 18-11               | DONE   | Yes — infra/DB first (blocks 18-01+)     |
| 8    | 18-01, 18-04, 18-05        | DONE   | Yes — XP engine, voice, onboarding       |
| 9    | 18-02, 18-07, 18-08        | DONE   | Yes — educator LCP, parent view, streak  |
| 10   | 18-03, 18-06, 18-10        | DONE   | Yes — narrative, content, course builder |
