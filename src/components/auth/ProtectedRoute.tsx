import { type ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useProfile } from '../../hooks/useProfile'
import { Spinner } from '../ui/Spinner'

type UserRole = 'learner' | 'parent' | 'educator' | 'admin'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles?: UserRole[]
}

/**
 * Wraps authenticated routes. Redirects unauthenticated users to /login.
 * When allowedRoles is provided, restricts access to matching roles.
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { session, initialized, loading } = useAuthStore()
  const { profile, loading: profileLoading } = useProfile()
  const navigate = useNavigate()

  const isLoading = !initialized || authLoading || (!!requiredRole && roleLoading)

  useEffect(() => {
    if (isLoading) return

    if (!session) {
      navigate('/login', { replace: true, state: { from: window.location.pathname } })
      return
    }

  useEffect(() => {
    if (!initialized || loading || profileLoading) return
    if (!session) return
    if (allowedRoles && profile && !allowedRoles.includes(profile.role as UserRole)) {
      navigate('/dashboard', { replace: true })
    }
  }, [session, initialized, loading, profileLoading, profile, allowedRoles, navigate])

  if (!initialized || loading || (session && profileLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center" aria-label="Loading…">
        <Spinner />
      </div>
    )
  }

  if (!session) return null

  if (allowedRoles && profile && !allowedRoles.includes(profile.role as UserRole)) {
    return null
  }

  return <>{children}</>
}
