/**
 * Diagnostic utilities — shared helpers for session diagnostic logic.
 */

const TRACE_DIMENSIONS = ['think', 'reason', 'articulate', 'check', 'extend', 'ethical'] as const

export type TraceDimension = (typeof TRACE_DIMENSIONS)[number]

/**
 * Returns the TRACE dimension with the lowest score, or null if no data.
 */
export function getWeakestTraceDimension(
  traceAverages: Record<string, number> | null | undefined,
): { dimension: string; score: number } | null {
  if (!traceAverages) return null

  let weakest: { dimension: string; score: number } | null = null

  for (const dim of TRACE_DIMENSIONS) {
    const score = traceAverages[dim]
    if (typeof score !== 'number') continue
    if (weakest === null || score < weakest.score) {
      weakest = { dimension: dim, score }
    }
  }

  return weakest
}

/**
 * Categorises a 0.0–1.0 difficulty float into a human-readable band.
 */
export function categorizeDifficulty(difficulty: number): 'beginner' | 'intermediate' | 'advanced' {
  if (difficulty <= 0.33) return 'beginner'
  if (difficulty <= 0.66) return 'intermediate'
  return 'advanced'
}
