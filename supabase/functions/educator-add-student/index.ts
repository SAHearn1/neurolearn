// supabase/functions/educator-add-student/index.ts
// Adds a student to one of the educator's classes.
// Idempotent: re-adding an already-enrolled student is a no-op.
//
// Method: POST
// Body: { class_id: string; student_id: string }
// Response: { enrolled: boolean; already_enrolled: boolean }

import { authenticate, requireClassOwner } from '../_shared/authz.ts'
import { parseBody, requireUuid } from '../_shared/validate.ts'
import { corsHeaders, json, handleError } from '../_shared/response.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const ctx = await authenticate(req)

    const body = await parseBody(req)
    const classId = requireUuid(body, 'class_id')
    const studentId = requireUuid(body, 'student_id')

    // Throws 403 if caller does not own the class.
    await requireClassOwner(ctx, classId)

    // Verify target is a learner.
    const { data: studentProfile } = await ctx.adminClient
      .from('profiles')
      .select('role')
      .eq('user_id', studentId)
      .maybeSingle()

    if (!studentProfile) return json({ error: 'Student not found' }, 404)
    if (studentProfile.role !== 'learner') {
      return json({ error: 'Target user is not a learner' }, 422)
    }

    // Check existing enrolment.
    const { data: existing } = await ctx.adminClient
      .from('class_enrollments')
      .select('id')
      .eq('class_id', classId)
      .eq('student_id', studentId)
      .maybeSingle()

    if (existing) return json({ enrolled: true, already_enrolled: true })

    const { error: insertError } = await ctx.adminClient
      .from('class_enrollments')
      .insert({ class_id: classId, student_id: studentId })

    if (insertError) throw new Error(insertError.message)

    return json({ enrolled: true, already_enrolled: false }, 201)
  } catch (err) {
    return handleError(err)
  }
})
