import { authenticate, requireRole } from '../_shared/authz.ts'
import { enforceRateLimit, getRateLimitKey } from '../_shared/rate-limit.ts'
import { handleError, json, preflight, rejectDisallowedOrigin } from '../_shared/response.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return preflight(req)

  const blockedOrigin = rejectDisallowedOrigin(req)
  if (blockedOrigin) return blockedOrigin

  try {
    const ctx = await authenticate(req)
    requireRole(ctx, ['learner', 'admin'])

    const limited = enforceRateLimit({
      key: getRateLimitKey(req, ctx.userId),
      limit: 60,
      windowMs: 60_000,
      req,
    })
    if (limited) return limited

    if (req.method === 'GET') {
      const url = new URL(req.url)
      const sessionId = url.searchParams.get('session_id')
      if (!sessionId) {
        return json({ error: 'session_id required' }, 400, req)
      }

      const { data, error } = await ctx.adminClient
        .from('cognitive_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('user_id', ctx.userId)
        .single()

      if (error) return json({ error: error.message }, 404, req)
      return json({ session: data }, 200, req)
    }

    if (req.method === 'POST') {
      const body = await req.json()

      const { error } = await ctx.adminClient.from('cognitive_sessions').upsert(
        {
          id: body.session_id,
          user_id: ctx.userId,
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

      if (error) return json({ error: error.message }, 500, req)
      return json({ success: true }, 200, req)
    }

    return json({ error: 'Method not allowed' }, 405, req)
  } catch (err) {
    console.error('session-sync error:', err)
    return handleError(err, req)
  }
})
