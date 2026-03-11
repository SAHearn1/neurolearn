import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useAuthStore } from '../store/authStore'

/**
 * ASS-01: Mastery Check Hook
 * Manages the mastery check flow for a given lessonId.
 * Queries mastery_cooldowns to determine if an attempt is allowed.
 */
export function useMasteryCheck(lessonId: string): {
  canAttempt: boolean
  cooldownUntil: Date | null
  startMasteryCheck: () => void
  loading: boolean
} {
  const user = useAuthStore((s) => s.user)
  const [canAttempt, setCanAttempt] = useState(false)
  const [cooldownUntil, setCooldownUntil] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCooldown = useCallback(async () => {
    if (!user?.id || !lessonId) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('mastery_cooldowns')
        .select('cooldown_until')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        // No cooldown row — can attempt
        setCanAttempt(true)
        setCooldownUntil(null)
      } else {
        const until = new Date(data.cooldown_until as string)
        const now = new Date()
        if (until < now) {
          setCanAttempt(true)
          setCooldownUntil(null)
        } else {
          setCanAttempt(false)
          setCooldownUntil(until)
        }
      }
    } catch {
      // On error, default to allowing attempt
      setCanAttempt(true)
      setCooldownUntil(null)
    } finally {
      setLoading(false)
    }
  }, [user?.id, lessonId])

  useEffect(() => {
    fetchCooldown()
  }, [fetchCooldown])

  const startMasteryCheck = useCallback(() => {
    // Navigating to session with mode=mastery_check is handled by the component
    // This hook exposes the trigger; components use useNavigate to handle routing
  }, [])

  return { canAttempt, cooldownUntil, startMasteryCheck, loading }
}
