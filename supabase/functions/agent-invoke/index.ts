import { authenticate, requireRole } from '../_shared/authz.ts'
import { enforceRateLimit, getRateLimitKey } from '../_shared/rate-limit.ts'
import { handleError, json, preflight, rejectDisallowedOrigin } from '../_shared/response.ts'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
const AI_MODEL = Deno.env.get('RACA_AI_MODEL') ?? 'claude-sonnet-4-6'

interface InvokeRequest {
  session_id: string
  agent_id: string
  learner_input: string
  system_prompt: string
  max_tokens: number
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

    const { data: session } = await ctx.adminClient
      .from('cognitive_sessions')
      .select('id, user_id, status')
      .eq('id', body.session_id)
      .eq('user_id', ctx.userId)
      .single()

    if (!session || session.status !== 'active') {
      return json({ error: 'Invalid or inactive session' }, 403, req)
    }

    const startTime = Date.now()
    const aiResponse = await callAI(body.system_prompt, body.learner_input, body.max_tokens)
    const responseTimeMs = Date.now() - startTime

    await ctx.adminClient.from('raca_agent_interactions').insert({
      session_id: body.session_id,
      agent_id: body.agent_id,
      state: 'UNKNOWN',
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
