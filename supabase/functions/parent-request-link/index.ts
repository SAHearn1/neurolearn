// supabase/functions/parent-request-link/index.ts
// A parent requests a monitoring link to a student (by student_id).
// Creates a pending parent_student_links row; the student must approve it.
//
// Method: POST
// Body: { student_id: string }
// Response: { link_id: string; status: 'pending' }

import { authenticate, requireRole } from '../_shared/authz.ts'
import { parseBody, requireUuid } from '../_shared/validate.ts'
import { corsHeaders, json, handleError } from '../_shared/response.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const ctx = await authenticate(req)
    requireRole(ctx, ['parent', 'admin'])

    const body = await parseBody(req)
    const studentId = requireUuid(body, 'student_id')

    // Verify the target is a learner (not linking to another parent/admin).
    const { data: studentProfile, error: profileError } = await ctx.adminClient
      .from('profiles')
      .select('user_id, role')
      .eq('user_id', studentId)
      .maybeSingle()

    if (profileError) throw new Error(profileError.message)
    if (!studentProfile) return json({ error: 'Student not found' }, 404)
    if (studentProfile.role !== 'learner') {
      return json({ error: 'Target user is not a learner' }, 422)
    }

    // Prevent duplicate links.
    const { data: existing } = await ctx.adminClient
      .from('parent_student_links')
      .select('id, status')
      .eq('parent_id', ctx.userId)
      .eq('student_id', studentId)
      .maybeSingle()

    if (existing) {
      return json({ link_id: existing.id, status: existing.status, already_exists: true })
    }

    const { data: link, error: insertError } = await ctx.adminClient
      .from('parent_student_links')
      .insert({ parent_id: ctx.userId, student_id: studentId, status: 'pending' })
      .select('id')
      .single()

    if (insertError) throw new Error(insertError.message)

    return json({ link_id: link.id, status: 'pending' }, 201)
  } catch (err) {
    return handleError(err)
  }
})
