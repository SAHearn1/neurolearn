// supabase/functions/educator-create-course/index.ts
// Creates a new draft course owned by the authenticated educator.
//
// Method: POST
// Body: { title: string; description?: string; level?: 'beginner'|'intermediate'|'advanced' }
// Response: { course_id: string; title: string; status: 'draft' }

import { authenticate, requireRole } from '../_shared/authz.ts'
import { parseBody, requireString, optionalString } from '../_shared/validate.ts'
import { corsHeaders, json, handleError } from '../_shared/response.ts'

const VALID_LEVELS = ['beginner', 'intermediate', 'advanced'] as const
type CourseLevel = typeof VALID_LEVELS[number]

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const ctx = await authenticate(req)
    requireRole(ctx, ['educator', 'admin'])

    const body = await parseBody(req)
    const title = requireString(body, 'title')
    const description = optionalString(body, 'description') ?? ''
    const levelRaw = optionalString(body, 'level') ?? 'beginner'

    if (!VALID_LEVELS.includes(levelRaw as CourseLevel)) {
      return json({ error: `Invalid level. Must be one of: ${VALID_LEVELS.join(', ')}` }, 400)
    }

    const { data: course, error: insertError } = await ctx.adminClient
      .from('courses')
      .insert({
        title,
        description,
        level: levelRaw as CourseLevel,
        status: 'draft',
        owner_id: ctx.userId,
      })
      .select('id, title, status')
      .single()

    if (insertError) throw new Error(insertError.message)

    return json({ course_id: course.id, title: course.title, status: course.status }, 201)
  } catch (err) {
    return handleError(err)
  }
})
