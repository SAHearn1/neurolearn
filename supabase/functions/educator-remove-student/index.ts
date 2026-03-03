// supabase/functions/educator-remove-student/index.ts
// Removes a student from one of the educator's classes.
//
// Method: POST
// Body: { class_id: string; student_id: string }
// Response: { removed: boolean }

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

    await requireClassOwner(ctx, classId)

    const { error: deleteError } = await ctx.adminClient
      .from('class_enrollments')
      .delete()
      .eq('class_id', classId)
      .eq('student_id', studentId)

    if (deleteError) throw new Error(deleteError.message)

    return json({ removed: true })
  } catch (err) {
    return handleError(err)
  }
})
