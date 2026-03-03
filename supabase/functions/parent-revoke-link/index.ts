// supabase/functions/parent-revoke-link/index.ts
// A parent revokes an existing (active or pending) monitoring link.
//
// Method: POST
// Body: { link_id: string }
// Response: { link_id: string; status: 'revoked' }

import { authenticate, requireRole } from '../_shared/authz.ts'
import { parseBody, requireUuid } from '../_shared/validate.ts'
import { corsHeaders, json, handleError } from '../_shared/response.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const ctx = await authenticate(req)
    requireRole(ctx, ['parent', 'admin'])

    const body = await parseBody(req)
    const linkId = requireUuid(body, 'link_id')

    // Fetch the link and verify caller is the parent.
    const { data: link, error: fetchError } = await ctx.adminClient
      .from('parent_student_links')
      .select('id, parent_id, status')
      .eq('id', linkId)
      .maybeSingle()

    if (fetchError) throw new Error(fetchError.message)
    if (!link) return json({ error: 'Link not found' }, 404)

    // Admins may revoke any link; parents may only revoke their own.
    if (ctx.role !== 'admin' && link.parent_id !== ctx.userId) {
      return json({ error: 'Access denied' }, 403)
    }

    if (link.status === 'revoked') {
      return json({ link_id: linkId, status: 'revoked', already_revoked: true })
    }

    const { error: updateError } = await ctx.adminClient
      .from('parent_student_links')
      .update({ status: 'revoked' })
      .eq('id', linkId)

    if (updateError) throw new Error(updateError.message)

    return json({ link_id: linkId, status: 'revoked' })
  } catch (err) {
    return handleError(err)
  }
})
