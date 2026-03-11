// EDU-14: Educator intervention alerts hook

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useAuthStore } from '../store/authStore'

export interface EducatorAlert {
  id: string
  studentId: string
  alertType: 'low_regulation' | 'no_activity' | 'mastery_plateau' | 'frustration_spike'
  message: string
  createdAt: string
  readAt: string | null
  dismissedAt: string | null
}

interface AlertRow {
  id: string
  student_id: string
  alert_type: string
  message: string
  created_at: string
  read_at: string | null
  dismissed_at: string | null
}

export function useEducatorAlerts(): {
  alerts: EducatorAlert[]
  unreadCount: number
  markRead: (alertId: string) => Promise<void>
  dismiss: (alertId: string) => Promise<void>
  loading: boolean
} {
  const user = useAuthStore((s) => s.user)
  const [alerts, setAlerts] = useState<EducatorAlert[]>([])
  const [loading, setLoading] = useState(false)
  // Use a ref to allow markRead/dismiss to trigger a re-fetch
  const refreshCounterRef = useRef(0)
  const [refreshCounter, setRefreshCounter] = useState(0)

  useEffect(() => {
    if (!user?.id) return

    let cancelled = false

    const run = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from('educator_alerts')
        .select('id, student_id, alert_type, message, created_at, read_at, dismissed_at')
        .eq('educator_id', user.id)
        .is('dismissed_at', null)
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (error || !data) {
        setLoading(false)
        return
      }

      setAlerts(
        (data as AlertRow[]).map((row) => ({
          id: row.id,
          studentId: row.student_id,
          alertType: row.alert_type as EducatorAlert['alertType'],
          message: row.message,
          createdAt: row.created_at,
          readAt: row.read_at,
          dismissedAt: row.dismissed_at,
        })),
      )
      setLoading(false)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [user?.id, refreshCounter])

  const triggerRefresh = useCallback(() => {
    refreshCounterRef.current += 1
    setRefreshCounter(refreshCounterRef.current)
  }, [])

  const markRead = useCallback(
    async (alertId: string) => {
      await supabase
        .from('educator_alerts')
        .update({ read_at: new Date().toISOString() })
        .eq('id', alertId)
      triggerRefresh()
    },
    [triggerRefresh],
  )

  const dismiss = useCallback(
    async (alertId: string) => {
      await supabase
        .from('educator_alerts')
        .update({ dismissed_at: new Date().toISOString() })
        .eq('id', alertId)
      triggerRefresh()
    },
    [triggerRefresh],
  )

  const unreadCount = alerts.filter((a) => a.readAt === null).length

  return { alerts, unreadCount, markRead, dismiss, loading }
}
