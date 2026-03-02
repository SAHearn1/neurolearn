import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useAuthStore } from '../store/authStore'
import type { UserProfile } from '../types/profile'

export function useProfile() {
  const user = useAuthStore((s) => s.user)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (err) throw err
      setProfile(data as UserProfile)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const updateProfile = useCallback(
    async (updates: Partial<Pick<UserProfile, 'display_name' | 'avatar_url' | 'learning_styles' | 'accessibility'>>) => {
      if (!user?.id) return
      const { error: err } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)

      if (err) throw err
      await fetchProfile()
    },
    [user?.id, fetchProfile],
  )

  return { profile, loading, error, updateProfile, refetch: fetchProfile }
}
