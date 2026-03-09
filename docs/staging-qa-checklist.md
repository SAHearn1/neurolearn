# NeuroLearn — Staging QA Checklist

Use this checklist before every production promotion. All items must pass on the `staging` branch deployment.

**Environment:** Vercel staging URL (branch: `staging`)
**Supabase:** `neurolearn-staging` project
**RACA flags:** All 8 enabled

---

## Pre-Flight

- [ ] All CI checks green on `staging` branch (validate → lighthouse → e2e)
- [ ] Migrations applied to staging Supabase (`supabase db push`)
- [ ] RACA feature flags all `true` in Vercel staging env vars
- [ ] `ANTHROPIC_API_KEY` set in Supabase staging Edge Function secrets
- [ ] Sentry DSN configured — staging project receiving events

---

## 1. Auth Flows

| Test                                          | Expected                                    | Pass |
| --------------------------------------------- | ------------------------------------------- | ---- |
| Sign up with age < 13                         | Blocked with age gate message               |      |
| Sign up with age ≥ 13                         | Account created, role assigned              |      |
| Sign up as educator (role selector)           | Role = educator, educator portal accessible |      |
| Sign up as parent                             | Role = parent, parent portal accessible     |      |
| Login with valid credentials                  | Redirected to dashboard                     |      |
| Login with invalid password                   | Error message shown                         |      |
| Password reset — request email                | "Check your email" confirmation shown       |      |
| Password reset — follow link                  | New password form loads, password updated   |      |
| Logout                                        | Redirected to home/login                    |      |
| Direct access to `/dashboard` unauthenticated | Redirect to `/login`                        |      |

---

## 2. Learner — Dashboard & Courses

| Test                      | Expected                                                      | Pass |
| ------------------------- | ------------------------------------------------------------- | ---- |
| Dashboard loads           | XP bar, streak badge, recent activity visible                 |      |
| Course list loads         | At least one course card visible                              |      |
| Navigate to course detail | Lesson list visible                                           |      |
| Open a text lesson        | Content renders                                               |      |
| Complete a lesson         | XP increments, progress bar updates                           |      |
| Milestone trigger         | Celebration animation fires at threshold (check localStorage) |      |
| Smart reminder            | Pomodoro timer appears, breaks prompt after interval          |      |

---

## 3. Learner — Onboarding (First-Run)

- [ ] Clear `localStorage` for test account (DevTools → Application → Clear All)
- [ ] Log in as learner
- [ ] Onboarding modal / wizard appears
- [ ] Goal selection step — can select learning goals
- [ ] Learning style quiz — responses saved
- [ ] RACA intro step — dismissible
- [ ] After completion — onboarding does not re-appear on page reload

---

## 4. RACA Cognitive Session

> Requires all 8 RACA feature flags enabled.

| Test                             | Expected                                                                          | Pass |
| -------------------------------- | --------------------------------------------------------------------------------- | ---- |
| Session starts from lesson       | SessionPage loads, ROOT state shown                                               |      |
| REGULATE state transition        | Regulation intervention options appear                                            |      |
| Regulation activity completes    | Advances to POSITION                                                              |      |
| All 9 state transitions          | ROOT → REGULATE → POSITION → PLAN → APPLY → REVISE → DEFEND → RECONNECT → ARCHIVE |      |
| AI agent responds (REVISE state) | Socratic/Feedback agent reply within 10s                                          |      |
| Voice input button visible       | Mic button present (Chrome/Edge)                                                  |      |
| Voice input records response     | Transcript populates response field                                               |      |
| TRACE score displayed            | Post-session TRACE bars shown (6 dimensions)                                      |      |
| XP multiplier reflects TRACE     | Higher TRACE → higher XP awarded                                                  |      |
| Session archived                 | Appears in Session History timeline on ProfilePage                                |      |
| Growth narrative generates       | AI summary text visible in Session History                                        |      |

---

## 5. Educator Portal

| Test                             | Expected                                         | Pass |
| -------------------------------- | ------------------------------------------------ | ---- |
| Educator dashboard loads         | Class count, student count stats shown           |      |
| Create a class                   | Class appears in list                            |      |
| Archive a class                  | Class removed from active list                   |      |
| Enroll student in class          | Student appears in class roster                  |      |
| StudentProgressTable             | Lesson completion data visible per student       |      |
| Assign course to class           | Course appears in class detail                   |      |
| Content Manager — create lesson  | Lesson saved with draft status                   |      |
| Content Manager — RACA phase tag | Phase tag dropdown visible, saves correctly      |      |
| EducatorAnalytics                | Completion rates, avg mastery metrics rendered   |      |
| LCP Dashboard                    | Per-student TRACE dimension bars visible         |      |
| Trajectory badges                | Correct badge (Rising/Steady/Breakthrough) shown |      |
| Educator messages                | Real-time message send/receive with parent       |      |

---

## 6. Parent Portal

| Test                     | Expected                                         | Pass |
| ------------------------ | ------------------------------------------------ | ---- |
| Parent dashboard loads   | Child summary cards visible                      |      |
| Link student flow        | Student linked via parent_student_links          |      |
| Progress reports         | Lesson completion cards per child                |      |
| Growth narrative view    | Read-only LCP summary + trajectory badge visible |      |
| Parent messages          | Real-time message send/receive with educator     |      |
| Notification preferences | Email/push toggle saves                          |      |

---

## 7. Admin Portal

| Test                                | Expected                                          | Pass |
| ----------------------------------- | ------------------------------------------------- | ---- |
| Admin dashboard loads               | Platform stats (users, lessons, completions)      |      |
| User management — list users        | Paginated user list visible                       |      |
| User management — change role       | Role updated, audit log entry created             |      |
| User management — soft delete       | User marked deleted, no longer in active list     |      |
| Content moderation — approve lesson | Status changes to approved                        |      |
| Content moderation — reject lesson  | Status changes to rejected                        |      |
| Audit log viewer                    | Recent entries visible, filterable by action type |      |
| Admin analytics                     | DAU, completion rate charts rendered              |      |

---

## 8. Accessibility Spot-Check

| Test                       | Expected                                            | Pass |
| -------------------------- | --------------------------------------------------- | ---- |
| Tab through login form     | Focus visible on all inputs and button              |      |
| Screen reader on dashboard | Landmarks announced correctly (main, nav)           |      |
| Modal focus trap           | Focus stays inside modal, Escape closes it          |      |
| Skip link                  | "Skip to content" appears on first Tab press        |      |
| Reduced motion             | Animations suppressed with `prefers-reduced-motion` |      |
| OpenDyslexic font toggle   | Font changes across app                             |      |

---

## 9. Observability

| Test                    | Expected                                           | Pass |
| ----------------------- | -------------------------------------------------- | ---- |
| Trigger a client error  | Error appears in Sentry staging project within 60s |      |
| Complete a lesson       | Vercel Analytics event recorded                    |      |
| Complete a RACA session | Session duration event recorded                    |      |

---

## Sign-Off

| Role        | Name | Date | Signature |
| ----------- | ---- | ---- | --------- |
| QA          |      |      |           |
| Engineering |      |      |           |

**Promote to production only when all items are checked.**
