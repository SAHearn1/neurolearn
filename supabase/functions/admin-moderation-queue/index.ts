// supabase/functions/admin-moderation-queue/index.ts
// Returns the content moderation queue for admin review.
//
// Method: POST
// Body: { status?: 'pending'|'approved'|'rejected'; limit?: number; offset?: number }
// Response: { flags: ContentFlag[]; total: number }

import { authenticate, requireRole } from '../_shared/authz.ts'
import { parseBody, optionalString, optionalNumber } from '../_shared/validate.ts'
import { corsHeaders, json, handleError } from '../_shared/response.ts'

const VALID_STATUSES = ['pending', 'approved', 'rejected']

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const ctx = await authenticate(req)
    requireRole(ctx, ['admin'])

    const body = req.method === 'POST' ? await parseBody(req) : {}
    const statusFilter = optionalString(body, 'status')
    const limit = optionalNumber(body, 'limit', 50)
    const offset = optionalNumber(body, 'offset', 0)

    if (statusFilter && !VALID_STATUSES.includes(statusFilter)) {
      return json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` }, 400)
    }

    let query = ctx.adminClient
      .from('content_flags')
      .select(
        'id, reporter_id, resource_type, resource_id, reason, status, reviewed_by, reviewed_at, reviewer_notes, created_at',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + Math.min(limit, 200) - 1)

    if (statusFilter) {
      query = query.eq('status', statusFilter)
    }

    const { data, error, count } = await query

    if (error) throw new Error(error.message)

    return json({ flags: data ?? [], total: count ?? 0 })
  } catch (err) {
    return handleError(err)
  }
})
