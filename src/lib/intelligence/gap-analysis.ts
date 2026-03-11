/**
 * Gap Analysis — analyses learner session data to produce actionable prescriptions.
 * AI-02: Gap Detection + Micro-Learning Prescription Engine.
 */

import type { SessionMasteryResult } from './mastery-scorer'

export interface LearnerGap {
  gapType: 'trace_weakness' | 'incomplete_states' | 'low_mastery' | 'first_session'
  description: string
  priority: number // 1-10
  recommendedAction: string
  recommendedLessonId?: string
}

/**
 * Analyses a session result to produce an array of LearnerGaps,
 * sorted by priority descending.
 */
export function analyzeGaps(params: {
  masteryResult: SessionMasteryResult
  traceScores?: Record<string, number>
  statesCompleted: string[]
  isFirstSession: boolean
}): LearnerGap[] {
  const { masteryResult, traceScores, statesCompleted, isFirstSession } = params
  const gaps: LearnerGap[] = []

  if (isFirstSession) {
    gaps.push({
      gapType: 'first_session',
      description: 'This is your first session. Building a consistent routine is key.',
      priority: 8,
      recommendedAction: 'Complete your first full session',
    })
  }

  if (masteryResult.masteryScore < 0.5) {
    gaps.push({
      gapType: 'low_mastery',
      description: `Your mastery score is ${(masteryResult.masteryScore * 100).toFixed(0)}%. More practice will help solidify understanding.`,
      priority: 9,
      recommendedAction: 'Revisit this lesson and try again with more depth',
    })
  }

  if (statesCompleted.length < 7) {
    gaps.push({
      gapType: 'incomplete_states',
      description: `You completed ${statesCompleted.length} of 9 cognitive states. A full session builds stronger mastery.`,
      priority: 7,
      recommendedAction: 'Complete all 9 cognitive states in your next session',
    })
  }

  if (traceScores) {
    for (const [dimension, score] of Object.entries(traceScores)) {
      if (typeof score === 'number' && score < 4) {
        gaps.push({
          gapType: 'trace_weakness',
          description: `Your "${dimension}" TRACE score is ${score.toFixed(1)}/10. This dimension needs focused practice.`,
          priority: 6,
          recommendedAction: `Practice activities that strengthen your "${dimension}" reasoning`,
        })
      }
    }
  }

  return gaps.sort((a, b) => b.priority - a.priority)
}
