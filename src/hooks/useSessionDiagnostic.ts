import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useAuthStore } from '../store/authStore'
import { getWeakestTraceDimension } from '../lib/intelligence/diagnostic-utils'
import type { TraceFluency } from '../lib/raca/types/epistemic'

export interface DiagnosticContext {
  isFirstSession: boolean
  currentDifficulty: number // 0.0-1.0
  masteryScore: number // 0.0-1.0
  weakestTraceRaw: string | null // e.g. 'articulate'
  weakestTraceScore: number | null
  lastSessionAt: string | null
  recommendedLessonId: string | null
}

interface AdaptiveRow {
  current_difficulty_float: number | null
  mastery_score_float: number | null
  recommended_lesson_id: string | null
  last_assessment_at: string | null
}

interface EpistemicRow {
  trace_averages: TraceFluency | null
}

/**
 * Queries adaptive_learning_state + epistemic_profiles for the current user
 * and returns a DiagnosticContext used to personalise the ROOT stage prompt.
 */
export function useSessionDiagnostic(lessonId: string | undefined): {
  diagnostic: DiagnosticContext | null
  loading: boolean
} {
  const user = useAuthStore((s) => s.user)
  const [diagnostic, setDiagnostic] = useState<DiagnosticContext | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id || !lessonId) {
      setLoading(false)
      return
    }

    let cancelled = false

    const run = async () => {
      setLoading(true)
      try {
        const [adaptiveResult, epistemicResult] = await Promise.all([
          supabase
            .from('adaptive_learning_state')
            .select(
              'current_difficulty_float, mastery_score_float, recommended_lesson_id, last_assessment_at',
            )
            .eq('user_id', user.id)
            .eq('lesson_id', lessonId)
            .single(),
          supabase
            .from('epistemic_profiles')
            .select('trace_averages')
            .eq('user_id', user.id)
            .single(),
        ])

        if (cancelled) return

        const adaptive = adaptiveResult.data as AdaptiveRow | null
        const epistemic = epistemicResult.data as EpistemicRow | null

        const isFirstSession = adaptive === null

        const traceAverages = epistemic?.trace_averages ?? null
        const weakest = getWeakestTraceDimension(traceAverages as Record<string, number> | null)

        setDiagnostic({
          isFirstSession,
          currentDifficulty: adaptive?.current_difficulty_float ?? 0.1,
          masteryScore: adaptive?.mastery_score_float ?? 0.0,
          weakestTraceRaw: weakest?.dimension ?? null,
          weakestTraceScore: weakest?.score ?? null,
          lastSessionAt: adaptive?.last_assessment_at ?? null,
          recommendedLessonId: adaptive?.recommended_lesson_id ?? null,
        })
      } catch {
        if (!cancelled) setDiagnostic(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [user?.id, lessonId])

  return { diagnostic, loading }
}
