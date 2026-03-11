import { useState, useCallback } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useAuthStore } from '../store/authStore'
import { analyzeGaps } from '../lib/intelligence/gap-analysis'
import type { LearnerGap } from '../lib/intelligence/gap-analysis'
import type { SessionMasteryResult } from '../lib/intelligence/mastery-scorer'

/**
 * Hook that runs gap analysis after a session and saves prescriptions to Supabase.
 * AI-02: Gap Detection + Micro-Learning Prescription Engine.
 */
export function useGapAnalysis(): {
  runGapAnalysis: (
    params: Parameters<typeof analyzeGaps>[0] & { lessonId?: string },
  ) => Promise<LearnerGap[]>
  gaps: LearnerGap[]
  loading: boolean
} {
  const user = useAuthStore((s) => s.user)
  const [gaps, setGaps] = useState<LearnerGap[]>([])
  const [loading, setLoading] = useState(false)

  const runGapAnalysis = useCallback(
    async (
      params: Parameters<typeof analyzeGaps>[0] & { lessonId?: string },
    ): Promise<LearnerGap[]> => {
      const { lessonId, ...analysisParams } = params
      setLoading(true)

      const detected = analyzeGaps(analysisParams)
      setGaps(detected)

      if (user?.id && detected.length > 0) {
        const rows = detected.map((gap) => ({
          user_id: user.id,
          lesson_id: lessonId ?? null,
          gap_type: gap.gapType,
          recommended_lesson_id: gap.recommendedLessonId ?? null,
          recommended_action: gap.recommendedAction,
          priority: gap.priority,
        }))

        try {
          await supabase.from('micro_learning_prescriptions').insert(rows)
        } catch {
          // Non-critical — swallow
        }
      }

      setLoading(false)
      return detected
    },
    [user],
  )

  return { runGapAnalysis, gaps, loading }
}

// Re-export for consumers that need the type without importing from gap-analysis directly
export type { LearnerGap, SessionMasteryResult }
