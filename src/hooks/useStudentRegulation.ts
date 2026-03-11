// EDU-13: Student regulation summary hook
// Queries regulation_checkins for each studentId

import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase/client'

export interface StudentRegulationSummary {
  userId: string
  averageRegulationLevel: number // 0-100
  sessionCount: number
  trend: 'improving' | 'stable' | 'declining' | 'unknown'
  lastSessionAt: string | null
}

function levelToNumber(level: string): number {
  if (level === 'ready') return 100
  if (level === 'distracted') return 50
  if (level === 'struggling') return 20
  return 50
}

function computeTrend(levels: number[]): StudentRegulationSummary['trend'] {
  if (levels.length < 2) return 'unknown'
  const avg = levels.reduce((a, b) => a + b, 0) / levels.length
  const last = levels[levels.length - 1]
  if (last > avg + 10) return 'improving'
  if (last < avg - 10) return 'declining'
  return 'stable'
}

interface CheckinRow {
  user_id: string
  level: string
  checked_in_at: string
}

export function useStudentRegulation(studentIds: string[]): {
  summaries: Record<string, StudentRegulationSummary>
  loading: boolean
} {
  const [summaries, setSummaries] = useState<Record<string, StudentRegulationSummary>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (studentIds.length === 0) return

    let cancelled = false

    const run = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from('regulation_checkins')
        .select('user_id, level, checked_in_at')
        .in('user_id', studentIds)
        .order('checked_in_at', { ascending: false })

      if (cancelled) return

      if (error || !data) {
        setLoading(false)
        return
      }

      // Group by user_id
      const grouped = new Map<string, CheckinRow[]>()
      for (const row of data as CheckinRow[]) {
        const existing = grouped.get(row.user_id) ?? []
        existing.push(row)
        grouped.set(row.user_id, existing)
      }

      const result: Record<string, StudentRegulationSummary> = {}

      for (const id of studentIds) {
        const rows = grouped.get(id) ?? []
        const last3 = rows.slice(0, 3)
        const levels = last3.map((r) => levelToNumber(r.level))
        const avg =
          levels.length > 0 ? Math.round(levels.reduce((a, b) => a + b, 0) / levels.length) : 0

        result[id] = {
          userId: id,
          averageRegulationLevel: avg,
          sessionCount: rows.length,
          trend: computeTrend(levels),
          lastSessionAt: rows[0]?.checked_in_at ?? null,
        }
      }

      setSummaries(result)
      setLoading(false)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [studentIds.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps

  return { summaries, loading }
}
