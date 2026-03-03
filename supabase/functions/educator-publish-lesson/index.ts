// supabase/functions/educator-publish-lesson/index.ts
// Publishes (or unpublishes) a lesson owned by the educator.
//
// Method: POST
// Body: { lesson_id: string; publish: boolean }
// Response: { lesson_id: string; status: 'published' | 'draft' }

import { authenticate, requireContentOwner } from '../_shared/authz.ts'
import { parseBody, requireUuid, requireBoolean } from '../_shared/validate.ts'
import { corsHeaders, json, handleError } from '../_shared/response.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const ctx = await authenticate(req)

    const body = await parseBody(req)
    const lessonId = requireUuid(body, 'lesson_id')
    const publish = requireBoolean(body, 'publish')

    await requireContentOwner(ctx, 'lessons', lessonId)

    const newStatus = publish ? 'published' : 'draft'

    const { error: updateError } = await ctx.adminClient
      .from('lessons')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', lessonId)

    if (updateError) throw new Error(updateError.message)

    return json({ lesson_id: lessonId, status: newStatus })
  } catch (err) {
    return handleError(err)
  }
})
