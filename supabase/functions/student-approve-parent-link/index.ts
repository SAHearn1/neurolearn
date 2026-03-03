// supabase/functions/student-approve-parent-link/index.ts
// The student approves (or rejects) a pending parent monitoring link.
//
// Method: POST
// Body: { link_id: string; approve: boolean }
// Response: { link_id: string; status: 'active' | 'revoked' }

import { authenticate } from '../_shared/authz.ts'
import { parseBody, requireUuid, requireBoolean } from '../_shared/validate.ts'
import { corsHeaders, json, handleError } from '../_shared/response.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const ctx = await authenticate(req)

    const body = await parseBody(req)
    const linkId = requireUuid(body, 'link_id')
    const approve = requireBoolean(body, 'approve')

    // Verify the caller is the student for this link.
    const { data: link, error: fetchError } = await ctx.adminClient
      .from('parent_student_links')
      .select('id, student_id, status')
      .eq('id', linkId)
      .maybeSingle()

    if (fetchError) throw new Error(fetchError.message)
    if (!link) return json({ error: 'Link not found' }, 404)
    if (link.student_id !== ctx.userId) return json({ error: 'Access denied' }, 403)
    if (link.status !== 'pending') {
      return json({ error: `Link is already ${link.status}` }, 422)
    }

    const newStatus = approve ? 'active' : 'revoked'

    const { error: updateError } = await ctx.adminClient
      .from('parent_student_links')
      .update({ status: newStatus })
      .eq('id', linkId)

    if (updateError) throw new Error(updateError.message)

    return json({ link_id: linkId, status: newStatus })
  } catch (err) {
    return handleError(err)
  }
})
