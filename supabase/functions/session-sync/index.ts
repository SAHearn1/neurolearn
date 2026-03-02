// supabase/functions/session-sync/index.ts
// Edge Function: Sync session state between client and database
//
// POST: Upsert session state
// GET:  Retrieve session state by session_id

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    if (req.method === 'GET') {
      const url = new URL(req.url)
      const sessionId = url.searchParams.get('session_id')
      if (!sessionId) {
        return jsonResponse({ error: 'session_id required' }, 400)
      }

      const { data, error } = await supabase
        .from('cognitive_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single()

      if (error) return jsonResponse({ error: error.message }, 404)
      return jsonResponse({ session: data })
    }

    if (req.method === 'POST') {
      const body = await req.json()

      const { error } = await supabase.from('cognitive_sessions').upsert(
        {
          id: body.session_id,
          user_id: user.id,
          lesson_id: body.lesson_id,
          course_id: body.course_id,
          status: body.status,
          current_state: body.current_state,
          state_history: body.state_history,
          regulation: body.regulation,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      )

      if (error) return jsonResponse({ error: error.message }, 500)
      return jsonResponse({ success: true })
    }

    return jsonResponse({ error: 'Method not allowed' }, 405)
  } catch (err) {
    console.error('session-sync error:', err)
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
