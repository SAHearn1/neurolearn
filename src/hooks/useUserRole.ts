import { useAuthStore } from '../store/authStore'
import type { UserRole } from '../types/profile'

export type { UserRole }

interface UseUserRoleResult {
  role: UserRole | null
  loading: boolean
}

/**
 * Returns the current user's role from the auth store.
 * Role is fetched once at sign-in/initialize and cached in the store —
 * no per-component Supabase query.
 */
export function useUserRole(): UseUserRoleResult {
  const role = useAuthStore((s) => s.role)
  const initialized = useAuthStore((s) => s.initialized)

  return { role, loading: !initialized }
}
