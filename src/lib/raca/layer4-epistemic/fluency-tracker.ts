import type { TraceFluency } from '../types/epistemic'
import type { Artifact } from '../types/artifacts'

/**
 * TRACE Fluency Tracker — scores the 6 fluency indicators (0-10).
 *
 * T = Think:      pause quality — did the learner take time before responding?
 * R = Reason:     explicit reasoning moves — logical connectives, evidence citation
 * A = Articulate: clarity of expression — sentence complexity, vocabulary
 * C = Check:      self-correction — revision behavior, error acknowledgment
 * E = Extend:     connection to broader ideas — transfer, generalization
 * E2= Ethical:    ethical reasoning markers — fairness, harm, equity, dignity (spec §VIII)
 */

/** Think score thresholds (milliseconds) — how long the learner paused before responding */
const THINK_THRESHOLDS = {
  DEEP: 30_000, // 30s+ = deep reflection (score 8)
  MODERATE: 15_000, // 15s+ = moderate pause (score 7)
  STANDARD: 5_000, // 5s+ = standard pause (score 5)
  QUICK: 2_000, // 2s+ = quick response (score 3)
  // <2s = impulsive (score 1)
} as const

/** Articulate score thresholds (words per sentence) — sentence complexity */
const ARTICULATE_THRESHOLDS = {
  COMPLEX: 20, // 20+ words/sentence = complex expression (score 8)
  MODERATE: 12, // 12+ = moderate complexity (score 6)
  SIMPLE: 6, // 6+ = simple sentences (score 4)
  // <6 = very simple (score 2)
} as const

/** Scoring multipliers for marker-based dimensions */
const SCORING_WEIGHTS = {
  CHECK_MARKER_MULTIPLIER: 2,
  CHECK_REVISION_MULTIPLIER: 3,
  EXTEND_MARKER_MULTIPLIER: 2.5,
  EXTEND_BASE: 1,
  REASON_MULTIPLIER: 5,
  REASON_BASE: 2,
  ETHICAL_MARKER_MULTIPLIER: 2.0,
  ETHICAL_BASE: 0,
} as const

/**
 * TRACE composite weights — how each dimension contributes to overall score.
 * Weights must sum to 1.0.
 * think=0.12 + reason=0.20 + articulate=0.17 + check=0.17 + extend=0.17 + ethical=0.17 = 1.00
 */
const TRACE_WEIGHTS = {
  think: 0.12,
  reason: 0.2,
  articulate: 0.17,
  check: 0.17,
  extend: 0.17,
  ethical: 0.17,
} as const

const REASONING_MARKERS = [
  /\bbecause\b/i,
  /\btherefore\b/i,
  /\bsince\b/i,
  /\bhowever\b/i,
  /\bfor example\b/i,
  /\bin contrast\b/i,
  /\bthis means\b/i,
  /\bif .+ then\b/i,
  /\bI think .+ because\b/i,
  /\bthe evidence (?:shows|suggests)\b/i,
]

const EXTENSION_MARKERS = [
  /\bthis connects to\b/i,
  /\bsimilar to\b/i,
  /\breminds me of\b/i,
  /\bin (?:another|a different) context\b/i,
  /\bmore broadly\b/i,
  /\bthis applies to\b/i,
  /\bbeyond this\b/i,
  /\bthis relates to\b/i,
]

const CHECK_MARKERS = [
  /\bactually\b/i,
  /\bwait\b/i,
  /\blet me (?:reconsider|rethink|revise)\b/i,
  /\bI was wrong\b/i,
  /\bon second thought\b/i,
  /\bcorrection\b/i,
  /\bI need to fix\b/i,
]

/**
 * Ethical reasoning markers — spec §VIII.
 * Detect references to fairness, harm, rights, equity, responsibility, dignity.
 * These are growth signals, not moral judgments.
 */
const ETHICAL_MARKERS = [
  /\bfair(?:ness)?\b/i,
  /\bunjust|injustice\b/i,
  /\bharm(?:ful|s)?\b/i,
  /\bright(?:s)?\b/i,
  /\bresponsib(?:le|ility)\b/i,
  /\bequit(?:y|able)\b/i,
  /\bdignity\b/i,
  /\bwho (?:benefits|is affected|does this help|does this hurt)\b/i,
  /\bstakeholder/i,
  /\bconsequence(?:s)?\b/i,
  /\bshould we\b/i,
  /\bis it (?:right|fair|just)\b/i,
  /\bimpact on (?:others|people|the community)\b/i,
  /\bmoral(?:ly)?\b/i,
  /\bethic(?:al|s)?\b/i,
]

export function scoreTRACE(artifacts: Artifact[], responseTimeMs?: number): TraceFluency {
  const allContent = artifacts.map((a) => a.content).join(' ')
  const totalWords = allContent.split(/\s+/).filter(Boolean).length

  // Think: based on response time (if available)
  let think = 5
  if (responseTimeMs !== undefined) {
    if (responseTimeMs > THINK_THRESHOLDS.DEEP) think = 8
    else if (responseTimeMs > THINK_THRESHOLDS.MODERATE) think = 7
    else if (responseTimeMs > THINK_THRESHOLDS.STANDARD) think = 5
    else if (responseTimeMs > THINK_THRESHOLDS.QUICK) think = 3
    else think = 1
  }

  // Reason: count reasoning markers per 100 words
  const reasoningHits = REASONING_MARKERS.filter((m) => m.test(allContent)).length
  const reason = Math.min(
    10,
    Math.round(
      (reasoningHits / Math.max(totalWords / 100, 1)) * SCORING_WEIGHTS.REASON_MULTIPLIER +
        SCORING_WEIGHTS.REASON_BASE,
    ),
  )

  // Articulate: sentence complexity and length
  const sentences = allContent.split(/[.!?]+/).filter((s) => s.trim().length > 5)
  const avgSentenceLen =
    sentences.length > 0
      ? sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / sentences.length
      : 0
  const articulate = Math.min(
    10,
    Math.round(
      avgSentenceLen > ARTICULATE_THRESHOLDS.COMPLEX
        ? 8
        : avgSentenceLen > ARTICULATE_THRESHOLDS.MODERATE
          ? 6
          : avgSentenceLen > ARTICULATE_THRESHOLDS.SIMPLE
            ? 4
            : 2,
    ),
  )

  // Check: self-correction markers + revision count
  const checkHits = CHECK_MARKERS.filter((m) => m.test(allContent)).length
  const revisions = artifacts.filter((a) => a.kind === 'revision').length
  const check = Math.min(
    10,
    checkHits * SCORING_WEIGHTS.CHECK_MARKER_MULTIPLIER +
      revisions * SCORING_WEIGHTS.CHECK_REVISION_MULTIPLIER,
  )

  // Extend: connection/transfer markers
  const extendHits = EXTENSION_MARKERS.filter((m) => m.test(allContent)).length
  const extend = Math.min(
    10,
    Math.round(extendHits * SCORING_WEIGHTS.EXTEND_MARKER_MULTIPLIER + SCORING_WEIGHTS.EXTEND_BASE),
  )

  // Ethical: ethical reasoning markers — spec §VIII
  const ethicalHits = ETHICAL_MARKERS.filter((m) => m.test(allContent)).length
  const ethical = Math.min(
    10,
    Math.round(
      ethicalHits * SCORING_WEIGHTS.ETHICAL_MARKER_MULTIPLIER + SCORING_WEIGHTS.ETHICAL_BASE,
    ),
  )

  // Overall: weighted composite (weights sum to 1.0)
  const overall = Math.round(
    think * TRACE_WEIGHTS.think +
      reason * TRACE_WEIGHTS.reason +
      articulate * TRACE_WEIGHTS.articulate +
      check * TRACE_WEIGHTS.check +
      extend * TRACE_WEIGHTS.extend +
      ethical * TRACE_WEIGHTS.ethical,
  )

  return { think, reason, articulate, check, extend, ethical, overall }
}
