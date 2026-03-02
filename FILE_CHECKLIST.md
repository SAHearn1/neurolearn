# NeuroLearn — File Checklist

Tracks the 82 core files for the NeuroLearn project scaffold.  
Mark items `[x]` as files are created and verified.

---

## Root Configuration

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

## Source — Core

- [x] `src/main.tsx`
- [x] `src/App.tsx`
- [x] `src/vite-env.d.ts`
- [x] `src/styles/index.css`

## Source — Pages

- [x] `src/pages/HomePage.tsx`
- [x] `src/pages/LoginPage.tsx`
- [x] `src/pages/SignUpPage.tsx`
- [x] `src/pages/DashboardPage.tsx`
- [x] `src/pages/CoursesPage.tsx`
- [x] `src/pages/CoursePage.tsx`
- [x] `src/pages/LessonPage.tsx`
- [x] `src/pages/ProfilePage.tsx`
- [x] `src/pages/SettingsPage.tsx`
- [x] `src/pages/NotFoundPage.tsx`

## Source — Components / UI

- [x] `src/components/ui/Button.tsx`
- [x] `src/components/ui/Card.tsx`
- [x] `src/components/ui/Modal.tsx`
- [x] `src/components/ui/Input.tsx`
- [x] `src/components/ui/Badge.tsx`
- [x] `src/components/ui/Spinner.tsx`
- [x] `src/components/ui/ProgressBar.tsx`
- [x] `src/components/ui/Avatar.tsx`
- [x] `src/components/ui/Tooltip.tsx`
- [x] `src/components/ui/Alert.tsx`

## Source — Components / Layout

- [ ] `src/components/layout/Header.tsx`
- [ ] `src/components/layout/Sidebar.tsx`
- [ ] `src/components/layout/Footer.tsx`
- [ ] `src/components/layout/PageWrapper.tsx`
- [ ] `src/components/layout/FocusMode.tsx`

## Source — Components / Lesson

- [ ] `src/components/lesson/LessonCard.tsx`
- [ ] `src/components/lesson/TextLesson.tsx`
- [ ] `src/components/lesson/AudioLesson.tsx`
- [ ] `src/components/lesson/VideoLesson.tsx`
- [ ] `src/components/lesson/InteractiveLesson.tsx`
- [ ] `src/components/lesson/QuizBlock.tsx`
- [ ] `src/components/lesson/LessonNav.tsx`

## Source — Components / Dashboard

- [ ] `src/components/dashboard/ProgressWidget.tsx`
- [ ] `src/components/dashboard/CourseCard.tsx`
- [ ] `src/components/dashboard/StreakBadge.tsx`
- [ ] `src/components/dashboard/RecentActivity.tsx`

## Source — Hooks

- [ ] `src/hooks/useAuth.ts`
- [ ] `src/hooks/useCourses.ts`
- [ ] `src/hooks/useLessons.ts`
- [ ] `src/hooks/useProgress.ts`
- [ ] `src/hooks/useProfile.ts`
- [ ] `src/hooks/useSettings.ts`

## Source — Store (Zustand)

- [ ] `src/store/authStore.ts`
- [ ] `src/store/settingsStore.ts`
- [ ] `src/store/progressStore.ts`

## Source — Types

- [ ] `src/types/index.ts`
- [ ] `src/types/course.ts`
- [ ] `src/types/lesson.ts`
- [ ] `src/types/profile.ts`
- [ ] `src/types/progress.ts`

## Utils / Supabase

- [x] `utils/supabase/info.tsx`
- [ ] `utils/supabase/client.ts`
- [ ] `utils/supabase/server.ts`
- [ ] `utils/helpers.ts`

## Supabase

- [ ] `supabase/config.toml`
- [ ] `supabase/migrations/001_create_profiles.sql`
- [ ] `supabase/migrations/002_create_courses.sql`
- [ ] `supabase/migrations/003_create_lessons.sql`
- [ ] `supabase/migrations/004_create_progress.sql`
- [ ] `supabase/seed.sql`

---

**Total tracked:** 83 files  
**Created:** 44  
**Remaining:** 39
