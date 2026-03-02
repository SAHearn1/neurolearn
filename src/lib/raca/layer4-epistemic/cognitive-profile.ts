import type { CognitiveProfile, TraceFluency } from '../types/epistemic'
import type { Artifact } from '../types/artifacts'
import { scoreTRACE } from './fluency-tracker'

/**
 * Cognitive Profile — longitudinal learner profile built from session data.
 * Used for adaptive support and teacher visibility, never for diagnostic labeling.
 */

export function buildCognitiveProfile(
  userId: string,
  sessionArtifacts: Artifact[][],
  existingProfile?: CognitiveProfile,
): CognitiveProfile {
  const sessionCount = sessionArtifacts.length
  const now = new Date().toISOString()

  if (sessionCount === 0) {
    return existingProfile ?? createEmptyProfile(userId)
  }

  // Compute per-session TRACE scores and average
  const traceScores = sessionArtifacts.map((artifacts) => scoreTRACE(artifacts))
  const traceAverages = averageTrace(traceScores)

  // Revision frequency: % of sessions with revision artifacts
  const sessionsWithRevision = sessionArtifacts.filter((arts) =>
    arts.some((a) => a.kind === 'revision'),
  ).length
  const revisionFrequency = sessionsWithRevision / sessionCount

  // Reflection depth: average word count of reflection artifacts
  const reflections = sessionArtifacts.flat().filter(
    (a) => a.kind === 'reflection' || a.kind === 'reconnection_reflection',
  )
  const reflectionDepthAvg = reflections.length > 0
    ? reflections.reduce((sum, a) => sum + a.word_count, 0) / reflections.length
    : 0

  // Defense strength: average word count of defense responses
  const defenses = sessionArtifacts.flat().filter((a) => a.kind === 'defense_response')
  const defenseStrengthAvg = defenses.length > 0
    ? defenses.reduce((sum, a) => sum + a.word_count, 0) / defenses.length
    : 0

  // Framing sophistication: average word count of position frames
  const frames = sessionArtifacts.flat().filter((a) => a.kind === 'position_frame')
  const framingSophistication = frames.length > 0
    ? frames.reduce((sum, a) => sum + a.word_count, 0) / frames.length
    : 0

  // Growth trajectory
  const growth = traceAverages.overall >= 7
    ? 'proficient' as const
    : traceAverages.overall >= 4
      ? 'developing' as const
      : 'emerging' as const

  return {
    user_id: userId,
    session_count: sessionCount,
    revision_frequency: Math.round(revisionFrequency * 100) / 100,
    reflection_depth_avg: Math.round(reflectionDepthAvg),
    defense_strength_avg: Math.round(defenseStrengthAvg),
    framing_sophistication: Math.round(framingSophistication),
    trace_averages: traceAverages,
    growth_trajectory: growth,
    updated_at: now,
  }
}

function createEmptyProfile(userId: string): CognitiveProfile {
  return {
    user_id: userId,
    session_count: 0,
    revision_frequency: 0,
    reflection_depth_avg: 0,
    defense_strength_avg: 0,
    framing_sophistication: 0,
    trace_averages: { think: 0, reason: 0, articulate: 0, check: 0, extend: 0, overall: 0 },
    growth_trajectory: 'emerging',
    updated_at: new Date().toISOString(),
  }
}

function averageTrace(scores: TraceFluency[]): TraceFluency {
  if (scores.length === 0) {
    return { think: 0, reason: 0, articulate: 0, check: 0, extend: 0, overall: 0 }
  }

  const sum = scores.reduce(
    (acc, s) => ({
      think: acc.think + s.think,
      reason: acc.reason + s.reason,
      articulate: acc.articulate + s.articulate,
      check: acc.check + s.check,
      extend: acc.extend + s.extend,
      overall: acc.overall + s.overall,
    }),
    { think: 0, reason: 0, articulate: 0, check: 0, extend: 0, overall: 0 },
  )

  const n = scores.length
  return {
    think: Math.round(sum.think / n * 10) / 10,
    reason: Math.round(sum.reason / n * 10) / 10,
    articulate: Math.round(sum.articulate / n * 10) / 10,
    check: Math.round(sum.check / n * 10) / 10,
    extend: Math.round(sum.extend / n * 10) / 10,
    overall: Math.round(sum.overall / n * 10) / 10,
  }
}
