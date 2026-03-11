import type { SupabaseClient } from '@supabase/supabase-js'
import type { TraceFluency } from '../raca/types/epistemic'

/**
 * AI-09: Cross-Session Memory Brief
 * Builds a longitudinal context summary for agent personalisation.
 */

export interface LongitudinalContext {
  recentSessionCount: number
  averageMasteryScore: number
  dominantWeakness: string | null
  consistentStrengths: string[]
  learningVelocity: 'accelerating' | 'steady' | 'plateaued' | 'declining'
  lastSessionAt: string | null
  totalSessionCount: number
}

interface AdaptiveRow {
  mastery_score_float: number | null
  recent_scores: number[] | null
  updated_at: string | null
}

interface EpistemicRow {
  trace_averages: TraceFluency | null
}

const TRACE_DIMENSION_LABELS: (keyof Omit<TraceFluency, 'overall'>)[] = [
  'think',
  'reason',
  'articulate',
  'check',
  'extend',
  'ethical',
]

function computeVelocity(recentScores: number[]): LongitudinalContext['learningVelocity'] {
  if (recentScores.length < 3) return 'steady'
  const first = recentScores[0]
  const last = recentScores[recentScores.length - 1]
  const avg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length
  const delta = last - first
  if (delta > 0.1) return 'accelerating'
  if (delta < -0.1) return 'declining'
  if (avg > 0.6) return 'steady'
  return 'plateaued'
}

export async function buildLongitudinalContext(
  client: SupabaseClient,
  userId: string,
): Promise<LongitudinalContext> {
  const [adaptiveResult, epistemicResult] = await Promise.all([
    client
      .from('adaptive_learning_state')
      .select('mastery_score_float, recent_scores, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    client.from('epistemic_profiles').select('trace_averages').eq('user_id', userId).maybeSingle(),
  ])

  const adaptive = adaptiveResult.data as AdaptiveRow | null
  const epistemic = epistemicResult.data as EpistemicRow | null

  const recentScores: number[] = adaptive?.recent_scores ?? []
  const recentSessionCount = recentScores.length
  const averageMasteryScore =
    recentSessionCount > 0 ? recentScores.reduce((a, b) => a + b, 0) / recentSessionCount : 0

  const traceAverages = epistemic?.trace_averages ?? null
  let dominantWeakness: string | null = null
  const consistentStrengths: string[] = []

  if (traceAverages) {
    let lowestScore = Infinity
    for (const dim of TRACE_DIMENSION_LABELS) {
      const score = traceAverages[dim]
      if (typeof score === 'number') {
        if (score < lowestScore) {
          lowestScore = score
          dominantWeakness = dim
        }
        if (score > 7) {
          consistentStrengths.push(dim)
        }
      }
    }
  }

  const learningVelocity = computeVelocity(recentScores)

  return {
    recentSessionCount,
    averageMasteryScore,
    dominantWeakness,
    consistentStrengths,
    learningVelocity,
    lastSessionAt: adaptive?.updated_at ?? null,
    totalSessionCount: recentSessionCount,
  }
}

function relativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  return `${days} days ago`
}

export function summarizeMemoryBrief(context: LongitudinalContext): string {
  if (context.totalSessionCount === 0) {
    return 'This appears to be an early session. Treat the learner as a new user.'
  }

  const avgPct = Math.round(context.averageMasteryScore * 100)
  const strengths =
    context.consistentStrengths.length > 0
      ? context.consistentStrengths.join(', ')
      : 'none identified yet'
  const weakness = context.dominantWeakness ?? 'none identified'
  const lastActive = context.lastSessionAt ? relativeTime(context.lastSessionAt) : 'unknown'

  return (
    `Learner profile: ${context.totalSessionCount} session${context.totalSessionCount === 1 ? '' : 's'} completed. ` +
    `Average mastery: ${avgPct}%. ` +
    `Learning velocity: ${context.learningVelocity}. ` +
    `Strongest TRACE dimensions: ${strengths}. ` +
    `Focus area: ${weakness}. ` +
    `Last active: ${lastActive}.`
  )
}
