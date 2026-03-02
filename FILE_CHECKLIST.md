# NeuroLearn — File Checklist

Tracks the 83 core files for the NeuroLearn project scaffold.  
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

- [x] `src/components/layout/Header.tsx`
- [x] `src/components/layout/Sidebar.tsx`
- [x] `src/components/layout/Footer.tsx`
- [x] `src/components/layout/PageWrapper.tsx`
- [x] `src/components/layout/FocusMode.tsx`

## Source — Components / Lesson

- [x] `src/components/lesson/LessonCard.tsx`
- [x] `src/components/lesson/TextLesson.tsx`
- [x] `src/components/lesson/AudioLesson.tsx`
- [x] `src/components/lesson/VideoLesson.tsx`
- [x] `src/components/lesson/InteractiveLesson.tsx`
- [x] `src/components/lesson/QuizBlock.tsx`
- [x] `src/components/lesson/LessonNav.tsx`

## Source — Components / Dashboard

- [x] `src/components/dashboard/ProgressWidget.tsx`
- [x] `src/components/dashboard/CourseCard.tsx`
- [x] `src/components/dashboard/StreakBadge.tsx`
- [x] `src/components/dashboard/RecentActivity.tsx`

## Source — Hooks

- [x] `src/hooks/useAuth.ts`
- [x] `src/hooks/useCourses.ts`
- [x] `src/hooks/useLessons.ts`
- [x] `src/hooks/useProgress.ts`
- [x] `src/hooks/useProfile.ts`
- [x] `src/hooks/useSettings.ts`

## Source — Store (Zustand)

- [x] `src/store/authStore.ts`
- [x] `src/store/settingsStore.ts`
- [x] `src/store/progressStore.ts`

## Source — Types

- [x] `src/types/index.ts`
- [x] `src/types/course.ts`
- [x] `src/types/lesson.ts`
- [x] `src/types/profile.ts`
- [x] `src/types/progress.ts`

## Utils / Supabase

- [x] `utils/supabase/info.tsx`
- [x] `utils/supabase/client.ts`
- [x] `utils/supabase/server.ts`
- [x] `utils/helpers.ts`

## Supabase

- [x] `supabase/config.toml`
- [x] `supabase/migrations/001_create_profiles.sql`
- [x] `supabase/migrations/002_create_courses.sql`
- [x] `supabase/migrations/003_create_lessons.sql`
- [x] `supabase/migrations/004_create_progress.sql`
- [x] `supabase/seed.sql`

---

**Total tracked:** 83 files  
**Created:** 44  
**Remaining:** 39
