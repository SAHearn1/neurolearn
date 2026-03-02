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
 */

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

export function scoreTRACE(
  artifacts: Artifact[],
  responseTimeMs?: number,
): TraceFluency {
  const allContent = artifacts.map((a) => a.content).join(' ')
  const totalWords = allContent.split(/\s+/).filter(Boolean).length

  // Think: based on response time (if available)
  let think = 5
  if (responseTimeMs !== undefined) {
    if (responseTimeMs > 30_000) think = 8
    else if (responseTimeMs > 15_000) think = 7
    else if (responseTimeMs > 5_000) think = 5
    else if (responseTimeMs > 2_000) think = 3
    else think = 1
  }

  // Reason: count reasoning markers
  const reasoningHits = REASONING_MARKERS.filter((m) => m.test(allContent)).length
  const reason = Math.min(10, Math.round((reasoningHits / Math.max(totalWords / 100, 1)) * 5 + 2))

  // Articulate: sentence complexity and length
  const sentences = allContent.split(/[.!?]+/).filter((s) => s.trim().length > 5)
  const avgSentenceLen = sentences.length > 0
    ? sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / sentences.length
    : 0
  const articulate = Math.min(10, Math.round(
    avgSentenceLen > 20 ? 8 : avgSentenceLen > 12 ? 6 : avgSentenceLen > 6 ? 4 : 2,
  ))

  // Check: self-correction markers + revision count
  const checkHits = CHECK_MARKERS.filter((m) => m.test(allContent)).length
  const revisions = artifacts.filter((a) => a.kind === 'revision').length
  const check = Math.min(10, checkHits * 2 + revisions * 3)

  // Extend: connection/transfer markers
  const extendHits = EXTENSION_MARKERS.filter((m) => m.test(allContent)).length
  const extend = Math.min(10, Math.round(extendHits * 2.5 + 1))

  // Overall: weighted composite
  const overall = Math.round(
    think * 0.15 + reason * 0.25 + articulate * 0.2 + check * 0.2 + extend * 0.2,
  )

  return { think, reason, articulate, check, extend, overall }
}
