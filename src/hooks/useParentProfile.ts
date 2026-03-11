import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useAuthStore } from '../store/authStore'
import type { ParentProfile } from '../types/parent'

export function useParentProfile() {
  const user = useAuthStore((s) => s.user)
  const [profile, setProfile] = useState<ParentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('parent_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (err) throw err
      setProfile(data as ParentProfile | null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load parent profile')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const upsertProfile = useCallback(
    async (updates: Partial<Omit<ParentProfile, 'user_id' | 'created_at' | 'updated_at'>>) => {
      if (!user?.id) return

      const { error: err } = await supabase.from('parent_profiles').upsert({
        user_id: user.id,
        ...updates,
        updated_at: new Date().toISOString(),
      })

      if (err) throw err
      await fetchProfile()
    },
    [user?.id, fetchProfile],
  )

  return { profile, loading, error, upsertProfile, refetch: fetchProfile }
}
