import { type ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Spinner } from '../ui/Spinner'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * Wraps authenticated routes. Redirects unauthenticated users to /login.
 * Role-level enforcement is handled within each role-specific dashboard page
 * via its own profile hook once the user is confirmed authenticated.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, initialized, loading } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!initialized || loading) return
    if (!session) {
      navigate('/login', { replace: true, state: { from: window.location.pathname } })
    }
  }, [session, initialized, loading, navigate])

  if (!initialized || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" aria-label="Loading…">
        <Spinner />
      </div>
    )
  }

  if (!session) return null

  return <>{children}</>
}
