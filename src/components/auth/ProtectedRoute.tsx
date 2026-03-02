import { type ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useUserRole, type UserRole } from '../../hooks/useUserRole'
import { Spinner } from '../ui/Spinner'

interface ProtectedRouteProps {
  children: ReactNode
  /**
   * When set, only users with this role (or 'admin') may access the route.
   * Unauthorised users are redirected to /dashboard.
   */
  requiredRole?: UserRole
}

/**
 * Wraps authenticated routes.
 * - Unauthenticated users → /login
 * - Wrong role → /dashboard
 * - Admin users bypass all role restrictions.
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { session, initialized, loading: authLoading } = useAuthStore()
  const { role, loading: roleLoading } = useUserRole()
  const navigate = useNavigate()

  const isLoading = !initialized || authLoading || (!!requiredRole && roleLoading)

  useEffect(() => {
    if (isLoading) return

    if (!session) {
      navigate('/login', { replace: true, state: { from: window.location.pathname } })
      return
    }

    if (requiredRole && role !== requiredRole && role !== 'admin') {
      navigate('/dashboard', { replace: true })
    }
  }, [session, initialized, isLoading, navigate, requiredRole, role])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" aria-label="Loading…">
        <Spinner />
      </div>
    )
  }

  if (!session) return null

  if (requiredRole && role !== requiredRole && role !== 'admin') return null

  return <>{children}</>
}
