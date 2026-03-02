import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Spinner } from './components/ui/Spinner'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { SignUpPage } from './pages/SignUpPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PasswordResetPage } from './pages/PasswordResetPage'

const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const CoursesPage = lazy(() =>
  import('./pages/CoursesPage').then((m) => ({ default: m.CoursesPage })),
)
const CoursePage = lazy(() =>
  import('./pages/CoursePage').then((m) => ({ default: m.CoursePage })),
)
const LessonPage = lazy(() =>
  import('./pages/LessonPage').then((m) => ({ default: m.LessonPage })),
)
const SessionPage = lazy(() =>
  import('./pages/SessionPage').then((m) => ({ default: m.SessionPage })),
)
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
)
const EducatorDashboardPage = lazy(() =>
  import('./pages/EducatorDashboardPage').then((m) => ({ default: m.EducatorDashboardPage })),
)

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner />
    </div>
  )
}

export function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<HomePage />} path="/" />
        <Route element={<LoginPage />} path="/login" />
        <Route element={<SignUpPage />} path="/signup" />
        <Route element={<PasswordResetPage />} path="/reset-password" />
        <Route element={<DashboardPage />} path="/dashboard" />
        <Route element={<CoursesPage />} path="/courses" />
        <Route element={<CoursePage />} path="/courses/:courseId" />
        <Route element={<LessonPage />} path="/courses/:courseId/lessons/:lessonId" />
        <Route element={<SessionPage />} path="/courses/:courseId/lessons/:lessonId/session" />
        <Route element={<EducatorDashboardPage />} path="/educator" />
        <Route element={<ProfilePage />} path="/profile" />
        <Route element={<SettingsPage />} path="/settings" />
        <Route element={<NotFoundPage />} path="*" />
      </Routes>
    </Suspense>
  )
}
