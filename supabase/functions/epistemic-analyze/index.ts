import { authenticate, requireRole } from '../_shared/authz.ts'
import { enforceRateLimit, getRateLimitKey } from '../_shared/rate-limit.ts'
import { handleError, json, preflight, rejectDisallowedOrigin } from '../_shared/response.ts'

interface AnalyzeRequest {
  user_id: string
  session_id: string
  artifacts: Array<{
    kind: string
    content: string
    word_count: number
  }>
  trace_scores: {
    think: number
    reason: number
    articulate: number
    check: number
    extend: number
    overall: number
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return preflight(req)

  const blockedOrigin = rejectDisallowedOrigin(req)
  if (blockedOrigin) return blockedOrigin

  try {
    const ctx = await authenticate(req)
    requireRole(ctx, ['learner', 'admin'])

    const limited = enforceRateLimit({
      key: getRateLimitKey(req, ctx.userId),
      limit: 20,
      windowMs: 60_000,
      req,
    })
    if (limited) return limited

    const body: AnalyzeRequest = await req.json()

    const { data: existing } = await ctx.adminClient
      .from('epistemic_profiles')
      .select('*')
      .eq('user_id', ctx.userId)
      .single()

    const sessionCount = (existing?.session_count ?? 0) + 1
    const revisionCount = body.artifacts.filter((a) => a.kind === 'revision').length
    const reflections = body.artifacts.filter(
      (a) => a.kind === 'reflection' || a.kind === 'reconnection_reflection',
    )
    const defenses = body.artifacts.filter((a) => a.kind === 'defense_response')
    const frames = body.artifacts.filter((a) => a.kind === 'position_frame')

    const prevCount = existing?.session_count ?? 0
    const runAvg = (prev: number, current: number) =>
      prevCount > 0 ? (prev * prevCount + current) / sessionCount : current

    const reflectionDepth = reflections.length > 0
      ? reflections.reduce((s, a) => s + a.word_count, 0) / reflections.length
      : 0

    const defenseStrength = defenses.length > 0
      ? defenses.reduce((s, a) => s + a.word_count, 0) / defenses.length
      : 0

    const framingSoph = frames.length > 0
      ? frames.reduce((s, a) => s + a.word_count, 0) / frames.length
      : 0

    const profile = {
      user_id: ctx.userId,
      session_count: sessionCount,
      revision_frequency: runAvg(existing?.revision_frequency ?? 0, revisionCount > 0 ? 1 : 0),
      reflection_depth_avg: runAvg(existing?.reflection_depth_avg ?? 0, reflectionDepth),
      defense_strength_avg: runAvg(existing?.defense_strength_avg ?? 0, defenseStrength),
      framing_sophistication: runAvg(existing?.framing_sophistication ?? 0, framingSoph),
      trace_averages: {
        think: runAvg(existing?.trace_averages?.think ?? 0, body.trace_scores.think),
        reason: runAvg(existing?.trace_averages?.reason ?? 0, body.trace_scores.reason),
        articulate: runAvg(existing?.trace_averages?.articulate ?? 0, body.trace_scores.articulate),
        check: runAvg(existing?.trace_averages?.check ?? 0, body.trace_scores.check),
        extend: runAvg(existing?.trace_averages?.extend ?? 0, body.trace_scores.extend),
        overall: runAvg(existing?.trace_averages?.overall ?? 0, body.trace_scores.overall),
      },
      growth_trajectory:
        body.trace_scores.overall >= 7 ? 'proficient' :
        body.trace_scores.overall >= 4 ? 'developing' : 'emerging',
      updated_at: new Date().toISOString(),
    }

    const { error } = await ctx.adminClient
      .from('epistemic_profiles')
      .upsert(profile, { onConflict: 'user_id' })

    if (error) return json({ error: error.message }, 500, req)

    return json({ profile }, 200, req)
  } catch (err) {
    console.error('epistemic-analyze error:', err)
    return handleError(err, req)
  }
})
