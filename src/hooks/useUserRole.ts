import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useAuthStore } from '../store/authStore'

export type UserRole = 'learner' | 'parent' | 'educator' | 'admin'

interface UseUserRoleResult {
  role: UserRole | null
  loading: boolean
}

/**
 * Fetches the current user's role from the profiles table.
 * Returns null while loading or if no session exists.
 */
export function useUserRole(): UseUserRoleResult {
  const user = useAuthStore((s) => s.user)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setRole(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error && data) {
          setRole(data.role as UserRole)
        } else {
          // Default to learner if profile not found yet
          setRole('learner')
        }
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user?.id])

  return { role, loading }
}
