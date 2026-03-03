// supabase/functions/learner-enroll-course/index.ts
// Enrols the authenticated learner in a course.
// Idempotent: re-enrolling an already-enrolled learner is a no-op.
//
// Method: POST
// Body: { course_id: string }
// Response: { enrolled: boolean; already_enrolled: boolean }

import { authenticate, requireRole } from '../_shared/authz.ts'
import { parseBody, requireUuid } from '../_shared/validate.ts'
import { corsHeaders, json, handleError } from '../_shared/response.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const ctx = await authenticate(req)
    requireRole(ctx, ['learner', 'admin'])

    const body = await parseBody(req)
    const courseId = requireUuid(body, 'course_id')

    // Verify the course exists and is published.
    const { data: course, error: courseError } = await ctx.adminClient
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .eq('status', 'published')
      .maybeSingle()

    if (courseError) throw new Error(courseError.message)
    if (!course) return json({ error: 'Course not found or not published' }, 404)

    // Check for an existing enrolment.
    const { data: existing, error: checkError } = await ctx.adminClient
      .from('course_enrollments')
      .select('id')
      .eq('user_id', ctx.userId)
      .eq('course_id', courseId)
      .maybeSingle()

    if (checkError) throw new Error(checkError.message)
    if (existing) return json({ enrolled: true, already_enrolled: true })

    // Insert new enrolment.
    const { error: insertError } = await ctx.adminClient
      .from('course_enrollments')
      .insert({ user_id: ctx.userId, course_id: courseId })

    if (insertError) throw new Error(insertError.message)

    return json({ enrolled: true, already_enrolled: false })
  } catch (err) {
    return handleError(err)
  }
})
