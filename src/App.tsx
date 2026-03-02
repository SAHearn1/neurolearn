import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Spinner } from './components/ui/Spinner'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { useAuth } from './hooks/useAuth'
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
const ParentDashboardPage = lazy(() =>
  import('./pages/ParentDashboardPage').then((m) => ({ default: m.ParentDashboardPage })),
)
const AdminDashboardPage = lazy(() =>
  import('./pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
)

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

  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Public routes */}
        <Route element={<HomePage />} path="/" />
        <Route element={<LoginPage />} path="/login" />
        <Route element={<SignUpPage />} path="/signup" />
        <Route element={<PasswordResetPage />} path="/reset-password" />

        {/* Authenticated routes */}
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
            <ProtectedRoute requiredRole="educator">
              <EducatorDashboardPage />
            </ProtectedRoute>
          }
          path="/educator"
        />
        <Route
          element={
            <ProtectedRoute requiredRole="parent">
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

        <Route element={<NotFoundPage />} path="*" />
      </Routes>
    </Suspense>
  )
}
