import { type ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Spinner } from '../ui/Spinner'
import type { UserRole } from '../../types/profile'

interface ProtectedRouteProps {
  children: ReactNode
  /**
   * When set, only users whose role appears in this list may access the route.
   * Unauthenticated users are redirected to /login.
   * Authenticated users with the wrong role are redirected to /dashboard.
   */
  allowedRoles?: UserRole[]
}

/**
 * Wraps authenticated routes.
 * - Unauthenticated users → /login
 * - Wrong role → /dashboard
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { session, initialized, loading, role } = useAuthStore()
  const navigate = useNavigate()

  const isLoading = !initialized || loading

  useEffect(() => {
    if (isLoading) return

    if (!session) {
      navigate('/login', { replace: true, state: { from: window.location.pathname } })
      return
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
      navigate('/dashboard', { replace: true })
    }
  }, [session, initialized, isLoading, navigate, allowedRoles, role])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" aria-label="Loading…">
        <Spinner />
      </div>
    )
  }

  if (!session) return null

  if (allowedRoles && role && !allowedRoles.includes(role)) return null

  return <>{children}</>
}
