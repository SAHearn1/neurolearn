import { Route, Routes } from 'react-router-dom'
import { PageWrapper } from './components/layout/PageWrapper'
import { CoursePage } from './pages/CoursePage'
import { CoursesPage } from './pages/CoursesPage'
import { DashboardPage } from './pages/DashboardPage'
import { HomePage } from './pages/HomePage'
import { LessonPage } from './pages/LessonPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProfilePage } from './pages/ProfilePage'
import { SettingsPage } from './pages/SettingsPage'
import { SignUpPage } from './pages/SignUpPage'

export function App() {
  return (
    <Routes>
      <Route element={<PageWrapper />}>
        <Route element={<HomePage />} path="/" />
        <Route element={<LoginPage />} path="/login" />
        <Route element={<SignUpPage />} path="/signup" />
        <Route element={<DashboardPage />} path="/dashboard" />
        <Route element={<CoursesPage />} path="/courses" />
        <Route element={<CoursePage />} path="/courses/:courseId" />
        <Route element={<LessonPage />} path="/courses/:courseId/lessons/:lessonId" />
        <Route element={<ProfilePage />} path="/profile" />
        <Route element={<SettingsPage />} path="/settings" />
        <Route element={<NotFoundPage />} path="*" />
      </Route>
    </Routes>
  )
}
