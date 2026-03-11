// DATA-02: Classroom real-time status hook
// Issue #335: upgraded from 30-second polling to Supabase Realtime subscription
// Falls back to 10-second polling if the Realtime channel cannot be established.

import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../utils/supabase/client'
import { STUDENT_STATE_LABELS } from '../lib/raca/types/cognitive-states'

export interface StudentSessionStatus {
  userId: string
  displayName: string
  currentState: string | null
  regulationLevel: number | null // from most recent regulation_checkin
  lastActiveAt: string | null
  isActive: boolean // active if lastActiveAt within last 10 minutes
}

interface ProfileRow {
  user_id: string
  display_name: string
}

interface CheckinRow {
  user_id: string
  level: string
  checked_in_at: string
}

interface SessionRow {
  user_id: string
  current_state: string
  updated_at: string
}

function levelToNumber(level: string): number {
  if (level === 'ready') return 100
  if (level === 'distracted') return 50
  return 20
}

function isActiveWithin10Min(isoDate: string | null): boolean {
  if (!isoDate) return false
  return Date.now() - new Date(isoDate).getTime() < 10 * 60 * 1000
}

/** Polling interval used as fallback when Realtime is unavailable */
const FALLBACK_POLL_MS = 10_000

export function useClassroomRealtime(studentIds: string[]): {
  statuses: StudentSessionStatus[]
  loading: boolean
} {
  const [statuses, setStatuses] = useState<StudentSessionStatus[]>([])
  const [loading, setLoading] = useState(false)
  const realtimeActiveRef = useRef(false)

  const idsKey = studentIds.join(',')

  useEffect(() => {
    const ids = idsKey ? idsKey.split(',') : []
    if (ids.length === 0) return

    let cancelled = false
    realtimeActiveRef.current = false

    const run = async () => {
      if (cancelled) return
      setLoading(true)

      const [profilesResult, checkinsResult, sessionsResult] = await Promise.all([
        supabase.from('profiles').select('user_id, display_name').in('user_id', ids),
        supabase
          .from('regulation_checkins')
          .select('user_id, level, checked_in_at')
          .in('user_id', ids)
          .order('checked_in_at', { ascending: false }),
        supabase
          .from('cognitive_sessions')
          .select('user_id, current_state, updated_at')
          .in('user_id', ids)
          .eq('status', 'active')
          .order('updated_at', { ascending: false }),
      ])

      if (cancelled) return

      const profiles = (profilesResult.data as ProfileRow[] | null) ?? []
      const checkins = (checkinsResult.data as CheckinRow[] | null) ?? []
      const sessions = (sessionsResult.data as SessionRow[] | null) ?? []

      const nameMap = new Map(profiles.map((p) => [p.user_id, p.display_name]))

      const regulationMap = new Map<string, { level: string; at: string }>()
      for (const c of checkins) {
        if (!regulationMap.has(c.user_id)) {
          regulationMap.set(c.user_id, { level: c.level, at: c.checked_in_at })
        }
      }

      const sessionMap = new Map<string, { state: string; at: string }>()
      for (const s of sessions) {
        if (!sessionMap.has(s.user_id)) {
          sessionMap.set(s.user_id, { state: s.current_state, at: s.updated_at })
        }
      }

      const result: StudentSessionStatus[] = ids.map((id) => {
        const checkin = regulationMap.get(id)
        const session = sessionMap.get(id)
        const lastActiveAt = session?.at ?? checkin?.at ?? null
        const stateLabel = session?.state
          ? (STUDENT_STATE_LABELS[session.state]?.label ?? session.state)
          : null

        return {
          userId: id,
          displayName: nameMap.get(id) ?? 'Student',
          currentState: stateLabel,
          regulationLevel: checkin ? levelToNumber(checkin.level) : null,
          lastActiveAt,
          isActive: isActiveWithin10Min(lastActiveAt),
        }
      })

      setStatuses(result)
      setLoading(false)
    }

    // Initial fetch
    run()

    // Supabase Realtime subscription — re-fetches full data on any cognitive_sessions change
    const channel = supabase
      .channel(`classroom-${idsKey}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cognitive_sessions' },
        (payload) => {
          // Filter to enrolled students only (RLS restricts rows server-side,
          // but double-check client-side for safety)
          const changedUserId =
            (payload.new as { user_id?: string } | null)?.user_id ??
            (payload.old as { user_id?: string } | null)?.user_id
          if (!changedUserId || !ids.includes(changedUserId)) return
          void run()
        },
      )
      .subscribe((status) => {
        realtimeActiveRef.current = status === 'SUBSCRIBED'
      })

    // Fallback polling — only fires if Realtime has not connected after initial grace period
    const fallbackInterval = setInterval(() => {
      if (!realtimeActiveRef.current) {
        void run()
      }
    }, FALLBACK_POLL_MS)

    return () => {
      cancelled = true
      clearInterval(fallbackInterval)
      void supabase.removeChannel(channel)
    }
  }, [idsKey])

  return { statuses, loading }
}
