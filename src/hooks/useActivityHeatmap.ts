import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useAuthStore } from '../store/authStore'

export interface DayActivity {
  lessonCount: number
  hasDeepSession: boolean
}

export function useActivityHeatmap() {
  const user = useAuthStore((s) => s.user)
  const [data, setData] = useState<Map<string, DayActivity>>(new Map())
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const cutoff = new Date(Date.now() - 84 * 24 * 60 * 60 * 1000).toISOString()
      const { data: rows } = await supabase
        .from('lesson_progress')
        .select('completed_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('completed_at', cutoff)
        .not('completed_at', 'is', null)

      const map = new Map<string, DayActivity>()
      for (const row of rows ?? []) {
        const date = (row.completed_at as string).slice(0, 10)
        const existing = map.get(date) ?? { lessonCount: 0, hasDeepSession: false }
        map.set(date, { ...existing, lessonCount: existing.lessonCount + 1 })
      }
      setData(map)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    void fetch()
  }, [fetch])

  return { data, loading }
}
