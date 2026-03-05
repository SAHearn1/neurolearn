import { authenticate, requireRole } from '../_shared/authz.ts'
import { enforceRateLimit, getRateLimitKey } from '../_shared/rate-limit.ts'
import { handleError, json, preflight, rejectDisallowedOrigin } from '../_shared/response.ts'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
const AI_MODEL = Deno.env.get('RACA_AI_MODEL') ?? 'claude-sonnet-4-6'

interface InvokeRequest {
  session_id: string
  agent_id: string
  state: string
  learner_input: string
  system_prompt: string
  max_tokens: number
}

/**
 * State → minimum required artifact kinds (spec §X/XIV).
 * AI cannot be invoked unless the learner has already submitted
 * the prerequisite artifact for their current cognitive state.
 * Only states that have an AI agent have precondition requirements.
 */
const STATE_PRECONDITION_ARTIFACT: Record<string, string[]> = {
  PLAN: ['reflection', 'position_frame'], // Framing/Research — must have reflected or positioned
  APPLY: ['plan_outline'], // Construction — must have a plan
  REVISE: ['draft'], // Critique — draft must precede AI critique (spec §X)
  DEFEND: ['draft', 'revision'], // Defense — must have a revised draft
  RECONNECT: ['defense_response'], // Framing (reconnect) — must have defended
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
      limit: 30,
      windowMs: 60_000,
      req,
    })
    if (limited) return limited

    const body: InvokeRequest = await req.json()

    // Verify session is active and belongs to this user
    const { data: session } = await ctx.adminClient
      .from('cognitive_sessions')
      .select('id, user_id, status')
      .eq('id', body.session_id)
      .eq('user_id', ctx.userId)
      .single()

    if (!session || session.status !== 'active') {
      return json({ error: 'Invalid or inactive session' }, 403, req)
    }

    // Spec §X/XIV: Enforce server-side artifact preconditions.
    // AI cannot be invoked if the learner has not produced the required
    // artifact for their current state. This prevents AI from being used
    // before the learner has engaged in the cognitive work.
    const requiredKinds = STATE_PRECONDITION_ARTIFACT[body.state]
    if (requiredKinds && requiredKinds.length > 0) {
      const { data: artifacts } = await ctx.adminClient
        .from('raca_artifacts')
        .select('kind')
        .eq('session_id', body.session_id)
        .in('kind', requiredKinds)

      const foundKinds = new Set((artifacts ?? []).map((a: { kind: string }) => a.kind))
      const missing = requiredKinds.filter((k) => !foundKinds.has(k))

      if (missing.length === requiredKinds.length) {
        // None of the required artifacts exist — block the invocation
        await ctx.adminClient.from('raca_agent_interactions').insert({
          session_id: body.session_id,
          agent_id: body.agent_id,
          state: body.state,
          prompt: body.learner_input,
          response: null,
          blocked: true,
          block_reason: `Precondition not met: learner must submit ${requiredKinds.join(' or ')} before AI can assist in ${body.state}`,
          response_time_ms: 0,
        })
        return json(
          {
            error: `Reflection required before AI assistance. Please submit your ${requiredKinds[0].replace('_', ' ')} first.`,
            blocked: true,
          },
          403,
          req,
        )
      }
    }

    const startTime = Date.now()
    const aiResponse = await callAI(body.system_prompt, body.learner_input, body.max_tokens)
    const responseTimeMs = Date.now() - startTime

    await ctx.adminClient.from('raca_agent_interactions').insert({
      session_id: body.session_id,
      agent_id: body.agent_id,
      state: body.state, // Fixed: was hardcoded 'UNKNOWN'
      prompt: body.learner_input,
      response: aiResponse,
      blocked: false,
      response_time_ms: responseTimeMs,
    })

    return json(
      {
        content: aiResponse,
        response_time_ms: responseTimeMs,
      },
      200,
      req,
    )
  } catch (err) {
    console.error('agent-invoke error:', err)
    return handleError(err, req)
  }
})

async function callAI(system: string, user: string, maxTokens: number): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: AI_MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`AI API error ${response.status}: ${text}`)
  }

  const data = await response.json()
  return data.content?.[0]?.text ?? ''
}
