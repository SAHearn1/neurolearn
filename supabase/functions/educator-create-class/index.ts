// supabase/functions/educator-create-class/index.ts
// Creates a new class owned by the authenticated educator.
//
// Method: POST
// Body: { name: string; description?: string }
// Response: { class_id: string; name: string }

import { authenticate, requireRole } from '../_shared/authz.ts'
import { parseBody, requireString, optionalString } from '../_shared/validate.ts'
import { corsHeaders, json, handleError } from '../_shared/response.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const ctx = await authenticate(req)
    requireRole(ctx, ['educator', 'admin'])

    const body = await parseBody(req)
    const name = requireString(body, 'name')
    const description = optionalString(body, 'description')

    const { data: cls, error: insertError } = await ctx.adminClient
      .from('classes')
      .insert({ educator_id: ctx.userId, name, description: description ?? null })
      .select('id, name')
      .single()

    if (insertError) throw new Error(insertError.message)

    return json({ class_id: cls.id, name: cls.name }, 201)
  } catch (err) {
    return handleError(err)
  }
})
