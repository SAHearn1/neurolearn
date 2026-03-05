import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useAuthStore } from '../store/authStore'

interface UseRacaStreakResult {
  racaStreakDays: number
  totalRacaSessions: number
  loading: boolean
}

function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0

  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)

  // Streak can start from today or yesterday (doesn't break if learner hasn't gone today yet)
  if (dates[0] !== todayStr && dates[0] !== yesterdayStr) return 0

  let streak = 0
  let expected = dates[0]

  for (const date of dates) {
    if (date === expected) {
      streak++
      const d = new Date(expected)
      d.setDate(d.getDate() - 1)
      expected = d.toISOString().slice(0, 10)
    } else {
      break
    }
  }

  return streak
}

/**
 * Computes the learner's consecutive RACA deep-work session streak (separate from lesson streak).
 * A streak day = any day with at least one completed cognitive_session.
 */
export function useRacaStreak(): UseRacaStreakResult {
  const user = useAuthStore((s) => s.user)
  const [racaStreakDays, setRacaStreakDays] = useState(0)
  const [totalRacaSessions, setTotalRacaSessions] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user?.id) return

    let cancelled = false

    const run = async () => {
      setLoading(true)

      const { data } = await supabase
        .from('cognitive_sessions')
        .select('started_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('started_at', { ascending: false })
        .limit(365) // enough for a full year streak

      if (cancelled) return

      const sessions = data ?? []
      setTotalRacaSessions(sessions.length)

      // Unique days, descending
      const uniqueDates = [
        ...new Set(sessions.map((s: { started_at: string }) => s.started_at.slice(0, 10))),
      ] as string[]

      setRacaStreakDays(computeStreak(uniqueDates))
      setLoading(false)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  return { racaStreakDays, totalRacaSessions, loading }
}
