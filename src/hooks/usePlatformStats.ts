// ADM-03: Platform Intelligence stats hook
// Issue #333: filled in real aggregations for mastery, regulation, sessions, CCSS, 5Rs

import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase/client'
import { STATE_METADATA } from '../lib/raca/types/cognitive-states'
import type { CognitiveState } from '../lib/raca/types/cognitive-states'

export interface PlatformStats {
  totalActiveLearners: number
  averageSessionsPerWeek: number
  averageMasteryScore: number
  averageRegulationLevel: number
  topStrandELA: number // % of learners with ELA evidence
  topStrandMath: number // % of learners with Math evidence
  alertsThisWeek: number
  lastUpdated: string
  /** 5Rs phase distribution across all currently-active sessions (#333) */
  fiveRDistribution: Record<string, number>
}

export function usePlatformStats(): {
  stats: PlatformStats | null
  loading: boolean
} {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      setLoading(true)

      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      const [
        profilesResult,
        alertsResult,
        masteryResult,
        checkinResult,
        sessionsWeekResult,
        activeSessionsResult,
        ccssResult,
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'learner'),
        supabase
          .from('educator_alerts')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', oneWeekAgo),
        supabase
          .from('adaptive_learning_state')
          .select('mastery_score_float')
          .not('mastery_score_float', 'is', null),
        supabase.from('regulation_checkins').select('level').gte('checked_in_at', oneWeekAgo),
        supabase
          .from('cognitive_sessions')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', oneWeekAgo),
        supabase.from('cognitive_sessions').select('current_state').eq('status', 'active'),
        supabase
          .from('student_ccss_evidence')
          .select('user_id, ccss_standards!inner(strand)')
          .not('user_id', 'is', null),
      ])

      if (cancelled) return

      // Average mastery score
      const masteryRows = (masteryResult.data ?? []) as { mastery_score_float: number }[]
      const averageMasteryScore =
        masteryRows.length > 0
          ? masteryRows.reduce((sum, r) => sum + r.mastery_score_float, 0) / masteryRows.length
          : 0

      // Average regulation level (convert text levels to numeric)
      const levelValues: Record<string, number> = { ready: 1, distracted: 0.5, stressed: 0.2 }
      const checkinRows = (checkinResult.data ?? []) as { level: string }[]
      const averageRegulationLevel =
        checkinRows.length > 0
          ? (checkinRows.reduce((sum, r) => sum + (levelValues[r.level] ?? 0.5), 0) /
              checkinRows.length) *
            100
          : 0

      // 5Rs distribution from active sessions
      const activeRows = (activeSessionsResult.data ?? []) as { current_state: string }[]
      const fiveRCounts: Record<string, number> = {
        Relate: 0,
        Regulate: 0,
        Reason: 0,
        Repair: 0,
        Restore: 0,
      }
      for (const row of activeRows) {
        if (row.current_state in STATE_METADATA) {
          const fiveR = STATE_METADATA[row.current_state as CognitiveState].fiveRMapping
          fiveRCounts[fiveR] = (fiveRCounts[fiveR] ?? 0) + 1
        }
      }

      // CCSS coverage % per strand
      const totalLearners = profilesResult.count ?? 1
      const ccssRows = (ccssResult.data ?? []) as {
        user_id: string
        ccss_standards: { strand: string } | { strand: string }[] | null
      }[]
      const elaLearners = new Set<string>()
      const mathLearners = new Set<string>()
      for (const row of ccssRows) {
        const std = Array.isArray(row.ccss_standards) ? row.ccss_standards[0] : row.ccss_standards
        if (!std) continue
        if (std.strand === 'ELA') elaLearners.add(row.user_id)
        if (std.strand === 'Math') mathLearners.add(row.user_id)
      }

      setStats({
        totalActiveLearners: profilesResult.count ?? 0,
        averageSessionsPerWeek: sessionsWeekResult.count ?? 0,
        averageMasteryScore,
        averageRegulationLevel,
        topStrandELA: totalLearners > 0 ? Math.round((elaLearners.size / totalLearners) * 100) : 0,
        topStrandMath:
          totalLearners > 0 ? Math.round((mathLearners.size / totalLearners) * 100) : 0,
        alertsThisWeek: alertsResult.count ?? 0,
        lastUpdated: new Date().toISOString(),
        fiveRDistribution: fiveRCounts,
      })

      setLoading(false)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  return { stats, loading }
}
