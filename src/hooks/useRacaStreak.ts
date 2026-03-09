import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useAuthStore } from '../store/authStore'

interface UseRacaStreakResult {
  racaStreakDays: number
  totalRacaSessions: number
  /** Sessions where the learner reached the REVISE state */
  reviseSessions: number
  /** Sessions where the learner reached the DEFEND state */
  defendSessions: number
  /** True if any session has a TRACE overall score ≥ 7 */
  hasDeepThinkerSession: boolean
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
 * Also returns badge metrics: revise/defend session counts and deep thinker status.
 */
export function useRacaStreak(): UseRacaStreakResult {
  const user = useAuthStore((s) => s.user)
  const [racaStreakDays, setRacaStreakDays] = useState(0)
  const [totalRacaSessions, setTotalRacaSessions] = useState(0)
  const [reviseSessions, setReviseSessions] = useState(0)
  const [defendSessions, setDefendSessions] = useState(0)
  const [hasDeepThinkerSession, setHasDeepThinkerSession] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user?.id) return

    let cancelled = false

    const run = async () => {
      setLoading(true)

      // Fetch completed sessions with state_history for badge metrics
      const { data: sessionsData } = await supabase
        .from('cognitive_sessions')
        .select('started_at, state_history')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('started_at', { ascending: false })
        .limit(365)

      // Fetch epistemic profile for Deep Thinker badge
      const { data: profileData } = await supabase
        .from('epistemic_profiles')
        .select('trace_averages')
        .eq('user_id', user.id)
        .maybeSingle()

      if (cancelled) return

      const sessions = (sessionsData ?? []) as Array<{
        started_at: string
        state_history: string[]
      }>

      setTotalRacaSessions(sessions.length)

      // Count sessions where learner reached REVISE or DEFEND
      let revise = 0
      let defend = 0
      for (const s of sessions) {
        const hist = s.state_history ?? []
        if (hist.includes('REVISE')) revise++
        if (hist.includes('DEFEND')) defend++
      }
      setReviseSessions(revise)
      setDefendSessions(defend)

      // Deep Thinker: TRACE overall average ≥ 7
      const traceAverages = (profileData?.trace_averages ?? {}) as { overall?: number }
      setHasDeepThinkerSession((traceAverages.overall ?? 0) >= 7)

      // Unique days, descending for streak calculation
      const uniqueDates = [...new Set(sessions.map((s) => s.started_at.slice(0, 10)))] as string[]

      setRacaStreakDays(computeStreak(uniqueDates))
      setLoading(false)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  return {
    racaStreakDays,
    totalRacaSessions,
    reviseSessions,
    defendSessions,
    hasDeepThinkerSession,
    loading,
  }
}
