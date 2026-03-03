// supabase/functions/educator-update-course/index.ts
// Updates metadata of a draft course owned by the educator.
// Cannot be used to change status (use educator-publish-course for that).
//
// Method: POST
// Body: { course_id: string; title?: string; description?: string; level?: string }
// Response: { course_id: string; updated: true }

import { authenticate, requireContentOwner } from '../_shared/authz.ts'
import { parseBody, requireUuid, optionalString } from '../_shared/validate.ts'
import { corsHeaders, json, handleError } from '../_shared/response.ts'

const VALID_LEVELS = ['beginner', 'intermediate', 'advanced']

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const ctx = await authenticate(req)

    const body = await parseBody(req)
    const courseId = requireUuid(body, 'course_id')

    await requireContentOwner(ctx, 'courses', courseId)

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }

    const title = optionalString(body, 'title')
    if (title) patch.title = title

    const description = optionalString(body, 'description')
    if (description !== undefined) patch.description = description ?? ''

    const level = optionalString(body, 'level')
    if (level) {
      if (!VALID_LEVELS.includes(level)) {
        return json({ error: `Invalid level. Must be one of: ${VALID_LEVELS.join(', ')}` }, 400)
      }
      patch.level = level
    }

    const { error: updateError } = await ctx.adminClient
      .from('courses')
      .update(patch)
      .eq('id', courseId)

    if (updateError) throw new Error(updateError.message)

    return json({ course_id: courseId, updated: true })
  } catch (err) {
    return handleError(err)
  }
})
