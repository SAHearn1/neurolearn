# NeuroLearn — File Checklist

Tracks all core files for the NeuroLearn platform.
Mark items `[x]` as files are created and verified.

---

## Root Configuration (19)

- [x] `README.md`
- [x] `TECHNICAL_SPECS.md`
- [x] `DEVELOPER_GUIDE.md`
- [x] `SETUP_GUIDE.md`
- [x] `FILE_CHECKLIST.md`
- [x] `CONTRIBUTING.md`
- [x] `CHANGELOG.md`
- [x] `LICENSE`
- [x] `.gitignore`
- [x] `.env.example`
- [x] `index.html`
- [x] `package.json`
- [x] `tsconfig.json`
- [x] `tsconfig.node.json`
- [x] `vite.config.ts`
- [x] `postcss.config.mjs`
- [x] `tailwind.config.js`
- [x] `eslint.config.js`
- [x] `.prettierrc`

## Source — Core (4)

- [x] `src/main.tsx`
- [x] `src/App.tsx`
- [x] `src/vite-env.d.ts`
- [x] `src/styles/index.css`

## Source — Pages (12)

- [x] `src/pages/HomePage.tsx`
- [x] `src/pages/LoginPage.tsx`
- [x] `src/pages/SignUpPage.tsx`
- [x] `src/pages/PasswordResetPage.tsx`
- [x] `src/pages/DashboardPage.tsx`
- [x] `src/pages/CoursesPage.tsx`
- [x] `src/pages/CoursePage.tsx`
- [x] `src/pages/LessonPage.tsx`
- [x] `src/pages/SessionPage.tsx`
- [x] `src/pages/ProfilePage.tsx`
- [x] `src/pages/SettingsPage.tsx`
- [x] `src/pages/NotFoundPage.tsx`

## Source — Components / UI (10)

- [x] `src/components/ui/Button.tsx`
- [x] `src/components/ui/Card.tsx`
- [x] `src/components/ui/Modal.tsx` (with focus trap)
- [x] `src/components/ui/Input.tsx`
- [x] `src/components/ui/Badge.tsx`
- [x] `src/components/ui/Spinner.tsx`
- [x] `src/components/ui/ProgressBar.tsx`
- [x] `src/components/ui/Avatar.tsx`
- [x] `src/components/ui/Tooltip.tsx`
- [x] `src/components/ui/Alert.tsx`

## Source — Components / Layout (5)

- [x] `src/components/layout/Header.tsx`
- [x] `src/components/layout/Sidebar.tsx`
- [x] `src/components/layout/Footer.tsx`
- [x] `src/components/layout/PageWrapper.tsx`
- [x] `src/components/layout/FocusMode.tsx`

## Source — Components / Lesson (7)

- [x] `src/components/lesson/LessonCard.tsx`
- [x] `src/components/lesson/TextLesson.tsx`
- [x] `src/components/lesson/AudioLesson.tsx`
- [x] `src/components/lesson/VideoLesson.tsx`
- [x] `src/components/lesson/InteractiveLesson.tsx`
- [x] `src/components/lesson/QuizBlock.tsx`
- [x] `src/components/lesson/LessonNav.tsx`

## Source — Components / Dashboard (4)

- [x] `src/components/dashboard/ProgressWidget.tsx`
- [x] `src/components/dashboard/CourseCard.tsx`
- [x] `src/components/dashboard/StreakBadge.tsx`
- [x] `src/components/dashboard/RecentActivity.tsx`

## Source — Components / RACA (11)

- [x] `src/components/raca/CognitiveStateIndicator.tsx`
- [x] `src/components/raca/StateTransitionBar.tsx`
- [x] `src/components/raca/ReflectionPrompt.tsx`
- [x] `src/components/raca/DraftEditor.tsx`
- [x] `src/components/raca/AgentPanel.tsx`
- [x] `src/components/raca/AgentMessage.tsx`
- [x] `src/components/raca/RevisionView.tsx`
- [x] `src/components/raca/DefensePanel.tsx`
- [x] `src/components/raca/EpistemicDashboard.tsx`
- [x] `src/components/raca/RegulationIntervention.tsx`
- [x] `src/components/raca/AuditTimeline.tsx`

## Source — Hooks (15)

- [x] `src/hooks/useAuth.ts`
- [x] `src/hooks/useCourses.ts`
- [x] `src/hooks/useLessons.ts`
- [x] `src/hooks/useProgress.ts`
- [x] `src/hooks/useProfile.ts`
- [x] `src/hooks/useSettings.ts`
- [x] `src/hooks/useSessionManager.ts`
- [x] `src/hooks/useRacaSession.ts`
- [x] `src/hooks/useCognitiveState.ts`
- [x] `src/hooks/useEpistemicProfile.ts`
- [x] `src/hooks/useAgent.ts`
- [x] `src/hooks/useAuditTrail.ts`

## Source — Store (4)

- [x] `src/store/authStore.ts`
- [x] `src/store/settingsStore.ts`
- [x] `src/store/progressStore.ts`
- [x] `src/store/racaStore.ts`

## Source — Types (6)

- [x] `src/types/index.ts`
- [x] `src/types/course.ts`
- [x] `src/types/lesson.ts`
- [x] `src/types/profile.ts`
- [x] `src/types/progress.ts`
- [x] `src/types/database.ts`

## Source — Lib (7)

- [x] `src/lib/logger.ts`
- [x] `src/lib/validation.ts`
- [x] `src/lib/focus-manager.ts`
- [x] `src/lib/reduced-motion.ts`
- [x] `src/lib/dyslexia-fonts.ts`
- [x] `src/lib/keyboard-nav.ts`
- [x] `src/lib/cors.ts`

## Source — Lib / RACA (30)

- [x] `src/lib/raca/feature-flags.ts`
- [x] `src/lib/raca/index.ts`
- [x] `src/lib/raca/types/` (7 files)
- [x] `src/lib/raca/layer0-runtime/` (5 files)
- [x] `src/lib/raca/layer1-cognitive-fsm/` (4 files)
- [x] `src/lib/raca/layer2-agent-router/` (3 files)
- [x] `src/lib/raca/layer3-agents/` (8 files)
- [x] `src/lib/raca/layer4-epistemic/` (4 files)
- [x] `src/lib/raca/guardrails/` (3 files)

## Source — Test Utilities (2)

- [x] `src/lib/test-utils.ts`
- [x] `src/lib/test-utils.test.ts`

## Utils / Supabase (4)

- [x] `utils/supabase/info.tsx`
- [x] `utils/supabase/client.ts`
- [x] `utils/supabase/server.ts`
- [x] `utils/helpers.ts`

## Supabase Config + Migrations (14)

- [x] `supabase/config.toml`
- [x] `supabase/migrations/001_profiles.sql`
- [x] `supabase/migrations/002_courses.sql`
- [x] `supabase/migrations/003_lessons.sql`
- [x] `supabase/migrations/004_lesson_progress.sql`
- [x] `supabase/migrations/005_roles_relationships.sql`
- [x] `supabase/migrations/006_supporting_tables.sql`
- [x] `supabase/migrations/007_adaptive_learning.sql`
- [x] `supabase/migrations/010_cognitive_sessions.sql`
- [x] `supabase/migrations/011_cognitive_states.sql`
- [x] `supabase/migrations/013_audit_events.sql`
- [x] `supabase/migrations/014_epistemic_profiles.sql`
- [x] `supabase/migrations/015_agent_interactions.sql`
- [x] `supabase/migrations/016_rls_policies.sql`
- [x] `supabase/seed.sql`

## Supabase Edge Functions (3)

- [x] `supabase/functions/agent-invoke/index.ts`
- [x] `supabase/functions/session-sync/index.ts`
- [x] `supabase/functions/epistemic-analyze/index.ts`

## Documentation (9)

- [x] `docs/adr/001-framework-selection.md`
- [x] `docs/adr/002-raca-cognitive-architecture.md`
- [x] `docs/adr/003-accessibility-strategy.md`
- [x] `docs/adr/004-security-model.md`
- [x] `docs/database-erd.md`
- [x] `docs/api-documentation.md`
- [x] `docs/rollback-procedure.md`
- [x] `docs/aria-strategy.md`
- [x] `docs/alt-text-strategy.md`

## CI/CD (2)

- [x] `.github/workflows/ci.yml`
- [x] `public/health.json`

## Tests (5)

- [x] `utils/helpers.test.ts`
- [x] `src/store/authStore.test.ts`
- [x] `src/store/settingsStore.test.ts`
- [x] `src/store/progressStore.test.ts`
- [x] `src/lib/validation.test.ts`

---

**Total tracked:** 137 files
**Created:** 137
**Remaining:** 0
