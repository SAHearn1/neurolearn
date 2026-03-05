import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useAuthStore } from '../store/authStore'

export interface SessionHistoryEntry {
  id: string
  started_at: string
  completed_at: string | null
  state_count: number
  artifact_count: number
  current_state: string
  status: string
}

interface UseSessionHistoryResult {
  sessions: SessionHistoryEntry[]
  loading: boolean
  error: string | null
}

/**
 * REQ-18-03 — Fetches the learner's completed RACA session history.
 * Returns sessions ordered by most recent, with artifact count from raca_artifacts.
 */
export function useSessionHistory(limit = 10): UseSessionHistoryResult {
  const user = useAuthStore((s) => s.user)
  const [sessions, setSessions] = useState<SessionHistoryEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return

    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(null)

      // Fetch completed sessions
      const { data: sessionData, error: sessionErr } = await supabase
        .from('cognitive_sessions')
        .select('id, started_at, completed_at, current_state, status, state_history')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('started_at', { ascending: false })
        .limit(limit)

      if (cancelled) return
      if (sessionErr) {
        setError(sessionErr.message)
        setLoading(false)
        return
      }

      if (!sessionData || sessionData.length === 0) {
        setSessions([])
        setLoading(false)
        return
      }

      const sessionIds = sessionData.map((s: { id: string }) => s.id)

      // Fetch artifact counts per session
      const { data: artifactData } = await supabase
        .from('raca_artifacts')
        .select('session_id')
        .in('session_id', sessionIds)

      if (cancelled) return

      const artifactCounts = new Map<string, number>()
      for (const a of artifactData ?? []) {
        const row = a as { session_id: string }
        artifactCounts.set(row.session_id, (artifactCounts.get(row.session_id) ?? 0) + 1)
      }

      setSessions(
        sessionData.map(
          (s: {
            id: string
            started_at: string
            completed_at: string | null
            current_state: string
            status: string
            state_history: string[]
          }) => ({
            id: s.id,
            started_at: s.started_at,
            completed_at: s.completed_at,
            current_state: s.current_state,
            status: s.status,
            state_count: (s.state_history ?? []).length,
            artifact_count: artifactCounts.get(s.id) ?? 0,
          }),
        ),
      )
      setLoading(false)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [user?.id, limit])

  return { sessions, loading, error }
}
