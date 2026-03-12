import { useCallback } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useAuthStore } from '../store/authStore'
import { computeSessionMastery } from '../lib/intelligence/mastery-scorer'
import type { ArtifactInput, SessionMasteryResult } from '../lib/intelligence/mastery-scorer'

/**
 * Hook that computes summative mastery at ARCHIVE and persists the result.
 * AI-05: Summative Mastery Evaluation at ARCHIVE.
 */
export function useMasteryScoring(): {
  archiveSession: (params: {
    sessionId: string
    lessonId: string
    courseId: string
    statesCompleted: string[]
    artifactText: string
    artifacts?: ArtifactInput[]
    sessionDurationMs: number
    traceScores?: Record<string, number>
  }) => Promise<SessionMasteryResult>
} {
  const user = useAuthStore((s) => s.user)

  const archiveSession = useCallback(
    async (params: {
      sessionId: string
      lessonId: string
      courseId: string
      statesCompleted: string[]
      artifactText: string
      artifacts?: ArtifactInput[]
      sessionDurationMs: number
      traceScores?: Record<string, number>
    }): Promise<SessionMasteryResult> => {
      const result = computeSessionMastery(params)

      if (!user?.id) return result

      // Persist course-level mastery score to adaptive_learning_state.
      const { error: adaptiveError } = await supabase
        .from('adaptive_learning_state')
        .update({
          mastery_score_float: result.masteryScore,
          last_assessment_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('course_id', params.courseId)

      if (adaptiveError) {
        throw adaptiveError
      }

      // Persist mastery_status to lesson_progress
      const { error: progressError } = await supabase
        .from('lesson_progress')
        .update({
          mastery_status: result.masteryStatus,
          mastery_source: 'raca_session',
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('lesson_id', params.lessonId)

      if (progressError) {
        throw progressError
      }

      // CCSS bridge: aggregate skill_evidence_events → student_ccss_evidence
      try {
        const { data: evidenceEvents } = await supabase
          .from('skill_evidence_events')
          .select('skill_code, confidence, evidence_type')
          .eq('session_id', params.sessionId)
          .eq('user_id', user.id)
          .not('skill_code', 'is', null)

        if (evidenceEvents && evidenceEvents.length > 0) {
          // Best confidence per skill_code (exclude no_evidence)
          const skillMap = new Map<string, number>()
          for (const ev of evidenceEvents) {
            if (!ev.skill_code || ev.evidence_type === 'no_evidence') continue
            const prev = skillMap.get(ev.skill_code) ?? 0
            if (ev.confidence > prev) skillMap.set(ev.skill_code, ev.confidence)
          }

          if (skillMap.size > 0) {
            const { data: ccssMap } = await supabase
              .from('skill_to_ccss_map')
              .select('skill_code, ccss_standard_code, mapping_strength')
              .in('skill_code', Array.from(skillMap.keys()))

            if (ccssMap && ccssMap.length > 0) {
              const now = new Date().toISOString()
              for (const mapping of ccssMap) {
                const skillConf = skillMap.get(mapping.skill_code) ?? 0
                const adjustedConf = skillConf * mapping.mapping_strength
                const masteryLevel =
                  adjustedConf >= 0.75
                    ? 'proficient'
                    : adjustedConf >= 0.5
                      ? 'developing'
                      : 'emerging'

                // Fetch existing row to accumulate evidence_count
                const { data: existing } = await supabase
                  .from('student_ccss_evidence')
                  .select('evidence_count, total_confidence')
                  .eq('user_id', user.id)
                  .eq('ccss_standard_code', mapping.ccss_standard_code)
                  .maybeSingle()

                const evidenceCount = (existing?.evidence_count ?? 0) + 1
                const totalConfidence = (existing?.total_confidence ?? 0) + adjustedConf

                await supabase.from('student_ccss_evidence').upsert(
                  {
                    user_id: user.id,
                    ccss_standard_code: mapping.ccss_standard_code,
                    evidence_count: evidenceCount,
                    total_confidence: totalConfidence,
                    mastery_level: masteryLevel,
                    last_evidenced_at: now,
                  },
                  { onConflict: 'user_id,ccss_standard_code' },
                )
              }
            }
          }
        }
      } catch {
        // Non-critical — swallow
      }

      return result
    },
    [user],
  )

  return { archiveSession }
}
