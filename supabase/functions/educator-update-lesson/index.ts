// supabase/functions/educator-update-lesson/index.ts
// Updates metadata/content of a draft lesson owned by the educator.
//
// Method: POST
// Body: { lesson_id, title?, description?, content?, type?, sort_order?, duration_minutes? }
// Response: { lesson_id: string; updated: true }

import { authenticate, requireContentOwner } from '../_shared/authz.ts'
import { parseBody, requireUuid, optionalString, optionalNumber } from '../_shared/validate.ts'
import { corsHeaders, json, handleError } from '../_shared/response.ts'

const VALID_TYPES = ['text', 'video', 'audio', 'interactive', 'quiz']

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const ctx = await authenticate(req)

    const body = await parseBody(req)
    const lessonId = requireUuid(body, 'lesson_id')

    await requireContentOwner(ctx, 'lessons', lessonId)

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }

    const title = optionalString(body, 'title')
    if (title) patch.title = title

    const description = optionalString(body, 'description')
    if (description !== undefined) patch.description = description ?? ''

    const content = optionalString(body, 'content')
    if (content !== undefined) patch.content = content ?? null

    const type = optionalString(body, 'type')
    if (type) {
      if (!VALID_TYPES.includes(type)) {
        return json({ error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` }, 400)
      }
      patch.type = type
    }

    const sortOrder = body.sort_order !== undefined ? optionalNumber(body, 'sort_order', 0) : undefined
    if (sortOrder !== undefined) patch.sort_order = sortOrder

    const durationMinutes = body.duration_minutes !== undefined
      ? optionalNumber(body, 'duration_minutes', 0) || null
      : undefined
    if (durationMinutes !== undefined) patch.duration_minutes = durationMinutes

    const { error: updateError } = await ctx.adminClient
      .from('lessons')
      .update(patch)
      .eq('id', lessonId)

    if (updateError) throw new Error(updateError.message)

    return json({ lesson_id: lessonId, updated: true })
  } catch (err) {
    return handleError(err)
  }
})
