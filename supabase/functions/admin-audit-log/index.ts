// supabase/functions/admin-audit-log/index.ts
// Returns a paginated view of the platform audit log.
//
// Method: POST
// Body: { actor_id?: string; action?: string; resource_type?: string; limit?: number; offset?: number }
// Response: { entries: AuditEntry[]; total: number }

import { authenticate, requireRole } from '../_shared/authz.ts'
import { parseBody, optionalString, optionalUuid, optionalNumber } from '../_shared/validate.ts'
import { corsHeaders, json, handleError } from '../_shared/response.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const ctx = await authenticate(req)
    requireRole(ctx, ['admin'])

    const body = req.method === 'POST' ? await parseBody(req) : {}
    const actorId = optionalUuid(body, 'actor_id')
    const action = optionalString(body, 'action')
    const resourceType = optionalString(body, 'resource_type')
    const limit = optionalNumber(body, 'limit', 50)
    const offset = optionalNumber(body, 'offset', 0)

    let query = ctx.adminClient
      .from('audit_log')
      .select(
        'id, actor_id, action, resource_type, resource_id, metadata, ip_address, created_at',
        { count: 'exact' },
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + Math.min(limit, 500) - 1)

    if (actorId) query = query.eq('actor_id', actorId)
    if (action) query = query.eq('action', action)
    if (resourceType) query = query.eq('resource_type', resourceType)

    const { data, error, count } = await query

    if (error) throw new Error(error.message)

    return json({ entries: data ?? [], total: count ?? 0 })
  } catch (err) {
    return handleError(err)
  }
})
