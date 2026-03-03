// supabase/functions/educator-publish-course/index.ts
// Publishes (or unpublishes) a course owned by the educator.
// A course must have at least one published lesson before it can be published.
//
// Method: POST
// Body: { course_id: string; publish: boolean }
// Response: { course_id: string; status: 'published' | 'draft' }

import { authenticate, requireContentOwner } from '../_shared/authz.ts'
import { parseBody, requireUuid, requireBoolean } from '../_shared/validate.ts'
import { corsHeaders, json, handleError } from '../_shared/response.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const ctx = await authenticate(req)

    const body = await parseBody(req)
    const courseId = requireUuid(body, 'course_id')
    const publish = requireBoolean(body, 'publish')

    await requireContentOwner(ctx, 'courses', courseId)

    if (publish) {
      // Require at least one published lesson.
      const { count, error: lessonError } = await ctx.adminClient
        .from('lessons')
        .select('id', { count: 'exact', head: true })
        .eq('course_id', courseId)
        .eq('status', 'published')

      if (lessonError) throw new Error(lessonError.message)
      if (!count || count === 0) {
        return json({ error: 'Course must have at least one published lesson before publishing' }, 422)
      }
    }

    const newStatus = publish ? 'published' : 'draft'

    const { error: updateError } = await ctx.adminClient
      .from('courses')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', courseId)

    if (updateError) throw new Error(updateError.message)

    return json({ course_id: courseId, status: newStatus })
  } catch (err) {
    return handleError(err)
  }
})
