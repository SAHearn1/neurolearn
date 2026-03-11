import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { Spinner } from './components/ui/Spinner'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { PageWrapper } from './components/layout/PageWrapper'
import { useAuth } from './hooks/useAuth'
import { useKeyboardNavigation } from './lib/keyboard-nav'

const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })))
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const SignUpPage = lazy(() => import('./pages/SignUpPage').then((m) => ({ default: m.SignUpPage })))
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)
const PasswordResetPage = lazy(() =>
  import('./pages/PasswordResetPage').then((m) => ({ default: m.PasswordResetPage })),
)
const CheckEmailPage = lazy(() =>
  import('./pages/CheckEmailPage').then((m) => ({ default: m.CheckEmailPage })),
)
const UpdatePasswordPage = lazy(() =>
  import('./pages/UpdatePasswordPage').then((m) => ({ default: m.UpdatePasswordPage })),
)

const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const CoursesPage = lazy(() =>
  import('./pages/CoursesPage').then((m) => ({ default: m.CoursesPage })),
)
const CoursePage = lazy(() => import('./pages/CoursePage').then((m) => ({ default: m.CoursePage })))
const LessonPage = lazy(() => import('./pages/LessonPage').then((m) => ({ default: m.LessonPage })))
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
const ParentDashboardPage = lazy(() =>
  import('./pages/ParentDashboardPage').then((m) => ({ default: m.ParentDashboardPage })),
)
const AdminDashboardPage = lazy(() =>
  import('./pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
)
const EducatorStudentDetailPage = lazy(() =>
  import('./pages/EducatorStudentDetailPage').then((m) => ({
    default: m.EducatorStudentDetailPage,
  })),
)

/**
 * Intercepts Supabase auth hash fragments that land on any page.
 * - Error fragments (#error=...) → /check-email with error details
 * - Success fragments (#access_token=...&type=signup|magiclink) → /dashboard
 * Must run inside the Router so useNavigate is available.
 */
function useAuthHashHandler() {
  const navigate = useNavigate()

  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return

    const params = new URLSearchParams(hash.slice(1)) // strip leading '#'

    // Clear the hash so a page refresh doesn't re-trigger this
    history.replaceState(null, '', location.pathname + location.search)

    const error = params.get('error')
    if (error) {
      const errorCode = params.get('error_code') ?? 'unknown'
      const errorDescription =
        params.get('error_description') ?? 'An authentication error occurred.'
      const qs = new URLSearchParams({ error_code: errorCode, error_description: errorDescription })
      navigate(`/check-email?${qs.toString()}`, { replace: true })
      return
    }

    // Successful email confirmation or magic link — SDK exchanges the token
    // automatically; navigate to dashboard once the hash is consumed.
    const accessToken = params.get('access_token')
    const type = params.get('type')
    if (accessToken && (type === 'signup' || type === 'magiclink')) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])
}

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner />
    </div>
  )
}

export function App() {
  // Initialize Supabase auth listener once at app root
  useAuth()
  // Enable keyboard vs mouse navigation detection
  useKeyboardNavigation()
  // Intercept Supabase auth error hash fragments (e.g. expired confirmation links)
  useAuthHashHandler()

  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Public routes */}
        <Route element={<HomePage />} path="/" />
        <Route element={<LoginPage />} path="/login" />
        <Route element={<SignUpPage />} path="/signup" />
        <Route element={<PasswordResetPage />} path="/password-reset" />
        <Route element={<Navigate replace to="/password-reset" />} path="/reset-password" />
        <Route element={<CheckEmailPage />} path="/check-email" />
        <Route element={<UpdatePasswordPage />} path="/update-password" />

        {/* Authenticated routes — rendered inside PageWrapper shell */}
        <Route element={<PageWrapper />}>
          <Route
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
            path="/dashboard"
          />
          <Route
            element={
              <ProtectedRoute>
                <CoursesPage />
              </ProtectedRoute>
            }
            path="/courses"
          />
          <Route
            element={
              <ProtectedRoute>
                <CoursePage />
              </ProtectedRoute>
            }
            path="/courses/:courseId"
          />
          <Route
            element={
              <ProtectedRoute>
                <LessonPage />
              </ProtectedRoute>
            }
            path="/courses/:courseId/lessons/:lessonId"
          />
          <Route
            element={
              <ProtectedRoute>
                <SessionPage />
              </ProtectedRoute>
            }
            path="/courses/:courseId/lessons/:lessonId/session"
          />
          <Route
            element={
              <ProtectedRoute requiredRole={['educator', 'admin']}>
                <EducatorDashboardPage />
              </ProtectedRoute>
            }
            path="/educator"
          />
          <Route
            element={
              <ProtectedRoute requiredRole={['educator', 'admin']}>
                <EducatorStudentDetailPage />
              </ProtectedRoute>
            }
            path="/educator/students/:studentId"
          />
          <Route
            element={
              <ProtectedRoute requiredRole={['parent', 'admin']}>
                <ParentDashboardPage />
              </ProtectedRoute>
            }
            path="/parent"
          />
          <Route
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
            path="/admin"
          />
          <Route
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
            path="/profile"
          />
          <Route
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
            path="/settings"
          />
        </Route>

        <Route element={<NotFoundPage />} path="*" />
      </Routes>
    </Suspense>
  )
}
