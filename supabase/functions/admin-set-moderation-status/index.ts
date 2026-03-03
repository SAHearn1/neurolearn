// supabase/functions/admin-set-moderation-status/index.ts
// Approves or rejects a content moderation flag.
//
// Method: POST
// Body: { flag_id: string; status: 'approved'|'rejected'; reviewer_notes?: string }
// Response: { flag_id: string; status: string }

import { authenticate, requireRole } from '../_shared/authz.ts'
import { parseBody, requireUuid, requireString, optionalString } from '../_shared/validate.ts'
import { corsHeaders, json, handleError } from '../_shared/response.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const ctx = await authenticate(req)
    requireRole(ctx, ['admin'])

    const body = await parseBody(req)
    const flagId = requireUuid(body, 'flag_id')
    const newStatus = requireString(body, 'status')
    const reviewerNotes = optionalString(body, 'reviewer_notes')

    if (!['approved', 'rejected'].includes(newStatus)) {
      return json({ error: "Status must be 'approved' or 'rejected'" }, 400)
    }

    // Verify flag exists.
    const { data: flag, error: fetchError } = await ctx.adminClient
      .from('content_flags')
      .select('id, status')
      .eq('id', flagId)
      .maybeSingle()

    if (fetchError) throw new Error(fetchError.message)
    if (!flag) return json({ error: 'Flag not found' }, 404)

    const { error: updateError } = await ctx.adminClient
      .from('content_flags')
      .update({
        status: newStatus,
        reviewed_by: ctx.userId,
        reviewed_at: new Date().toISOString(),
        reviewer_notes: reviewerNotes ?? null,
      })
      .eq('id', flagId)

    if (updateError) throw new Error(updateError.message)

    // Audit log.
    await ctx.adminClient.from('audit_log').insert({
      actor_id: ctx.userId,
      action: 'admin.moderation_decision',
      resource_type: 'content_flag',
      resource_id: flagId,
      metadata: { old_status: flag.status, new_status: newStatus },
    })

    return json({ flag_id: flagId, status: newStatus })
  } catch (err) {
    return handleError(err)
  }
})
