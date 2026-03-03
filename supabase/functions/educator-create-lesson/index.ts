// supabase/functions/educator-create-lesson/index.ts
// Creates a new draft lesson within a course the educator owns.
//
// Method: POST
// Body: { course_id, title, type?, description?, content?, sort_order?, duration_minutes? }
// Response: { lesson_id: string; title: string; status: 'draft' }

import { authenticate, requireContentOwner } from '../_shared/authz.ts'
import { parseBody, requireUuid, requireString, optionalString, optionalNumber } from '../_shared/validate.ts'
import { corsHeaders, json, handleError } from '../_shared/response.ts'

const VALID_TYPES = ['text', 'video', 'audio', 'interactive', 'quiz'] as const
type LessonType = typeof VALID_TYPES[number]

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const ctx = await authenticate(req)

    const body = await parseBody(req)
    const courseId = requireUuid(body, 'course_id')
    const title = requireString(body, 'title')

    // Verify the educator owns the parent course.
    await requireContentOwner(ctx, 'courses', courseId)

    const typeRaw = optionalString(body, 'type') ?? 'text'
    if (!VALID_TYPES.includes(typeRaw as LessonType)) {
      return json({ error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` }, 400)
    }

    const description = optionalString(body, 'description') ?? ''
    const content = optionalString(body, 'content') ?? null
    const sortOrder = optionalNumber(body, 'sort_order', 0)
    const durationMinutes = optionalNumber(body, 'duration_minutes', 0) || null

    const { data: lesson, error: insertError } = await ctx.adminClient
      .from('lessons')
      .insert({
        course_id: courseId,
        title,
        type: typeRaw as LessonType,
        description,
        content,
        status: 'draft',
        sort_order: sortOrder,
        duration_minutes: durationMinutes,
        owner_id: ctx.userId,
      })
      .select('id, title, status')
      .single()

    if (insertError) throw new Error(insertError.message)

    return json({ lesson_id: lesson.id, title: lesson.title, status: lesson.status }, 201)
  } catch (err) {
    return handleError(err)
  }
})
