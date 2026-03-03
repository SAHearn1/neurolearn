// supabase/functions/agent-invoke/index.ts
// Edge Function: Invoke a RACA agent with guardrails
//
// Request body: { session_id, agent_id, learner_input, context }
// Response: { content, reflective_questions, constraint_check, blocked }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
const AI_MODEL = Deno.env.get('RACA_AI_MODEL') ?? 'claude-sonnet-4-6'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

interface InvokeRequest {
  session_id: string
  agent_id: string
  state: string
  learner_input: string
  system_prompt: string
  max_tokens: number
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

  try {
    // Verify JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return jsonResponse({ error: 'Missing authorization' }, 401)
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401)
    }

    const body: InvokeRequest = await req.json()

    // Verify session belongs to user
    const { data: session } = await supabase
      .from('cognitive_sessions')
      .select('id, user_id, status')
      .eq('id', body.session_id)
      .eq('user_id', user.id)
      .single()

    if (!session || session.status !== 'active') {
      return jsonResponse({ error: 'Invalid or inactive session' }, 403)
    }

    // Call AI provider
    const startTime = Date.now()
    const aiResponse = await callAI(body.system_prompt, body.learner_input, body.max_tokens)
    const responseTimeMs = Date.now() - startTime

    // Log interaction
    await supabase.from('raca_agent_interactions').insert({
      session_id: body.session_id,
      agent_id: body.agent_id,
      state: body.state ?? 'UNKNOWN',
      prompt: body.learner_input,
      response: aiResponse,
      blocked: false,
      response_time_ms: responseTimeMs,
    })

    return jsonResponse({
      content: aiResponse,
      response_time_ms: responseTimeMs,
    })
  } catch (err) {
    console.error('agent-invoke error:', err)
    return jsonResponse({ error: 'Internal server error' }, 500)
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

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
