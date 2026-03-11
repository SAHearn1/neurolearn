/**
 * Mastery Scorer — computes a summative mastery score when a RACA session reaches ARCHIVE.
 * AI-05: Summative Mastery Evaluation at ARCHIVE.
 *
 * Issue #336: added TRACE dimension minimum thresholds and artifact kind weighting.
 *
 * Scoring weights:
 *   - statesCoverage (0.4): how many of the 9 RACA states were completed
 *   - depthScore (0.3):     artifact word depth, weighted by kind (defense_response > draft)
 *   - traceAverage (0.3):   average of all 6 TRACE dimensions / 10, or 0.5 if unavailable
 *
 * TRACE gate: if any dimension in TRACE_MIN_THRESHOLDS scores below its minimum,
 * masteryStatus is capped at 'in_progress' regardless of overall score.
 */

export interface ArtifactInput {
  kind: string
  content: string
  word_count: number
}

export interface SessionMasteryResult {
  masteryScore: number // 0.0-1.0 weighted average
  masteryStatus: 'not_started' | 'in_progress' | 'developing' | 'proficient'
  statesCompleted: number // out of 9
  artifactWordCount: number
  sessionDurationMs: number
}

const TOTAL_STATES = 9

/**
 * Artifact kind weights — higher-order thinking artifacts contribute more to depth score.
 * Gap H fix: defense_response (1.5×) and revision (1.3×) outweigh draft (1.0×).
 */
const ARTIFACT_KIND_WEIGHTS: Record<string, number> = {
  defense_response: 1.5,
  revision: 1.3,
  reconnection_reflection: 1.2,
  reflection: 1.2,
  draft: 1.0,
  position_frame: 1.0,
  plan_outline: 1.0,
}

/**
 * TRACE dimension minimum thresholds.
 * Scores are 0–10; thresholds are integers.
 * Failing any threshold caps masteryStatus at 'in_progress'.
 *
 * Gap B fix: check (self-correction) and reason (explicit reasoning) are non-negotiable
 * for any CCSS standard evidence. ethical is a lower bar but required.
 */
const TRACE_MIN_THRESHOLDS: Record<string, number> = {
  check: 4,
  reason: 4,
  ethical: 3,
}

export function computeSessionMastery(params: {
  statesCompleted: string[]
  artifactText: string
  sessionDurationMs: number
  traceScores?: Record<string, number>
  artifacts?: ArtifactInput[]
}): SessionMasteryResult {
  const { statesCompleted, artifactText, sessionDurationMs, traceScores, artifacts } = params

  if (statesCompleted.length === 0) {
    return {
      masteryScore: 0,
      masteryStatus: 'not_started',
      statesCompleted: 0,
      artifactWordCount: 0,
      sessionDurationMs,
    }
  }

  const statesCoverage = statesCompleted.length / TOTAL_STATES

  // Depth score — use kind-weighted word count when artifacts are available
  let depthScore: number
  let totalWordCount: number
  if (artifacts && artifacts.length > 0) {
    const weightedWords = artifacts.reduce((sum, a) => {
      const weight = ARTIFACT_KIND_WEIGHTS[a.kind] ?? 1.0
      return sum + a.word_count * weight
    }, 0)
    totalWordCount = artifacts.reduce((sum, a) => sum + a.word_count, 0)
    depthScore = Math.min(weightedWords / 300, 1.0)
  } else {
    const words = artifactText.trim().split(/\s+/).filter(Boolean).length
    totalWordCount = words
    depthScore = Math.min(words / 300, 1.0)
  }

  // TRACE average
  let traceAverage = 0.5
  if (traceScores) {
    const values = Object.values(traceScores).filter((v) => typeof v === 'number')
    if (values.length > 0) {
      traceAverage = values.reduce((a, b) => a + b, 0) / values.length / 10
    }
  }

  const masteryScore = statesCoverage * 0.4 + depthScore * 0.3 + traceAverage * 0.3

  // TRACE gate: check minimum thresholds — cap at in_progress if any dimension fails
  let traceGatePassed = true
  if (traceScores) {
    for (const [dim, minScore] of Object.entries(TRACE_MIN_THRESHOLDS)) {
      if ((traceScores[dim] ?? 0) < minScore) {
        traceGatePassed = false
        break
      }
    }
  }

  let masteryStatus: SessionMasteryResult['masteryStatus']
  if (traceGatePassed && masteryScore >= 0.7) {
    masteryStatus = 'proficient'
  } else if (masteryScore >= 0.4) {
    masteryStatus = 'in_progress'
  } else {
    masteryStatus = 'developing'
  }

  return {
    masteryScore,
    masteryStatus,
    statesCompleted: statesCompleted.length,
    artifactWordCount: totalWordCount,
    sessionDurationMs,
  }
}
