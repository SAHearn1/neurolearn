import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useAuthStore } from '../store/authStore'
import type { CognitiveProfile } from '../lib/raca/types/epistemic'

interface UseCognitiveProfileResult {
  cognitiveProfile: CognitiveProfile | null
  loading: boolean
  error: string | null
}

/**
 * Fetches the persisted Learner Cognitive Profile (LCP) from the
 * epistemic_profiles table. Used to surface longitudinal TRACE growth
 * data in the learner profile view — spec §XII.
 */
export function useCognitiveProfile(): UseCognitiveProfileResult {
  const user = useAuthStore((s) => s.user)
  const [cognitiveProfile, setCognitiveProfile] = useState<CognitiveProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return

    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(null)
      const { data, error: err } = await supabase
        .from('epistemic_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (cancelled) return
      if (err && err.code !== 'PGRST116') {
        // PGRST116 = no row found (profile built after first session)
        setError(err.message)
      } else {
        setCognitiveProfile(data ?? null)
      }
      setLoading(false)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  return { cognitiveProfile, loading, error }
}
