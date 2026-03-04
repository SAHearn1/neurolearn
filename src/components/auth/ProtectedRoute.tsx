import { type ReactNode, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { Spinner } from '../ui/Spinner'
import type { UserRole } from '../../types/profile'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: UserRole | UserRole[]
}

function isRoleAllowed(role: UserRole | null, requiredRole?: UserRole | UserRole[]) {
  if (!requiredRole) return true
  if (!role) return false
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  return requiredRoles.includes(role)
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { session, initialized, loading, role } = useAuthStore()
  const navigate = useNavigate()
  const isLoading = !initialized || loading
  const hasAccess = isRoleAllowed(role, requiredRole)

  useEffect(() => {
    if (isLoading) return

    if (!session) {
      navigate('/login', { replace: true, state: { from: window.location.pathname } })
      return
    }

    if (!hasAccess) {
      navigate('/dashboard', { replace: true })
    }
  }, [hasAccess, isLoading, navigate, session])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" aria-label="Loading…">
        <Spinner />
      </div>
    )
  }

  if (!session || !hasAccess) return null

  return <>{children}</>
}
