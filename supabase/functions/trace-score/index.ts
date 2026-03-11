// supabase/functions/trace-score/index.ts
// AI-03: TRACE Fluency Auto-Scorer — Edge Function Stub
//
// POST { artifactText, cognitiveState, sessionId }
// Returns { think, reason, articulate, check, extend, ethical } all 0–10
//
// TODO: Replace heuristic with Claude claude-sonnet-4-6 scoring when
//       ANTHROPIC_API_KEY is configured (spec §VIII).

import { handleError, json, preflight, rejectDisallowedOrigin } from '../_shared/response.ts'
import { authenticate } from '../_shared/authz.ts'
import { enforceRateLimit, getRateLimitKey } from '../_shared/rate-limit.ts'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TraceScoreRequest {
  artifactText: string
  cognitiveState: string
  sessionId: string
}

interface TraceScores {
  think: number
  reason: number
  articulate: number
  check: number
  extend: number
  ethical: number
}

// ---------------------------------------------------------------------------
// Heuristic scorer
// ---------------------------------------------------------------------------

/**
 * Simple heuristic: word count / 100, capped at 10 per dimension.
 * All 6 TRACE dimensions receive the same placeholder value.
 *
 * TODO: Replace heuristic with Claude claude-sonnet-4-6 scoring when
 *       ANTHROPIC_API_KEY is configured (spec §VIII, TRACE 6-dimension spec
 *       added 2026-03-05). The model should receive the artifact text and
 *       cognitive state, then return per-dimension scores 0–10.
 */
function computeHeuristicScores(artifactText: string): TraceScores {
  const wordCount = artifactText.trim() === '' ? 0 : artifactText.trim().split(/\s+/).length
  const score = Math.min(wordCount / 100, 10)
  const rounded = Math.round(score * 10) / 10

  return {
    think: rounded,
    reason: rounded,
    articulate: rounded,
    check: rounded,
    extend: rounded,
    ethical: rounded,
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return preflight(req)

  const blockedOrigin = rejectDisallowedOrigin(req)
  if (blockedOrigin) return blockedOrigin

  try {
    const ctx = await authenticate(req)

    const limited = enforceRateLimit({
      key: getRateLimitKey(req, ctx.userId),
      limit: 60,
      windowMs: 60_000,
      req,
    })
    if (limited) return limited

    const body: TraceScoreRequest = await req.json()

    if (!body.artifactText || !body.cognitiveState || !body.sessionId) {
      return json(
        { error: 'Invalid request. Required: artifactText, cognitiveState, sessionId' },
        400,
        req,
      )
    }

    const scores = computeHeuristicScores(body.artifactText)

    return json(scores, 200, req)
  } catch (err) {
    console.error('trace-score error:', err)
    return handleError(err, req)
  }
})
