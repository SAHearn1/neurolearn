// supabase/functions/epistemic-analyze/index.ts
// Edge Function: Analyze epistemic data and update cognitive profile
//
// POST: Analyze session artifacts and update learner profile

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

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
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return jsonResponse({ error: 'Missing authorization' }, 401)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  try {
    const body: AnalyzeRequest = await req.json()

    // Fetch existing profile
    const { data: existing } = await supabase
      .from('epistemic_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Compute updated profile metrics
    const sessionCount = (existing?.session_count ?? 0) + 1
    const revisionCount = body.artifacts.filter((a) => a.kind === 'revision').length
    const reflections = body.artifacts.filter(
      (a) => a.kind === 'reflection' || a.kind === 'reconnection_reflection',
    )
    const defenses = body.artifacts.filter((a) => a.kind === 'defense_response')
    const frames = body.artifacts.filter((a) => a.kind === 'position_frame')

    // Running averages
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
      user_id: user.id,
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

    const { error } = await supabase
      .from('epistemic_profiles')
      .upsert(profile, { onConflict: 'user_id' })

    if (error) return jsonResponse({ error: error.message }, 500)

    return jsonResponse({ profile })
  } catch (err) {
    console.error('epistemic-analyze error:', err)
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
})

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
