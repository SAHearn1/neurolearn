// supabase/functions/admin-set-role/index.ts
// Sets a user's role. Only admins can promote/demote roles.
// Changing role to 'admin' is intentionally allowed here — admins may
// grant admin access to others, but this action is always audit-logged.
//
// Method: POST
// Body: { user_id: string; role: 'learner'|'parent'|'educator'|'admin' }
// Response: { user_id: string; role: string }

import { authenticate, requireRole } from '../_shared/authz.ts'
import { parseBody, requireUuid, requireString } from '../_shared/validate.ts'
import { corsHeaders, json, handleError } from '../_shared/response.ts'

const VALID_ROLES = ['learner', 'parent', 'educator', 'admin']

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const ctx = await authenticate(req)
    requireRole(ctx, ['admin'])

    const body = await parseBody(req)
    const userId = requireUuid(body, 'user_id')
    const newRole = requireString(body, 'role')

    if (!VALID_ROLES.includes(newRole)) {
      return json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}` }, 400)
    }

    // Verify target user exists.
    const { data: profile, error: fetchError } = await ctx.adminClient
      .from('profiles')
      .select('user_id, role')
      .eq('user_id', userId)
      .maybeSingle()

    if (fetchError) throw new Error(fetchError.message)
    if (!profile) return json({ error: 'User not found' }, 404)

    const { error: updateError } = await ctx.adminClient
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('user_id', userId)

    if (updateError) throw new Error(updateError.message)

    // Audit log the role change.
    await ctx.adminClient.from('audit_log').insert({
      actor_id: ctx.userId,
      action: 'admin.set_role',
      resource_type: 'user',
      resource_id: userId,
      metadata: { old_role: profile.role, new_role: newRole },
    })

    return json({ user_id: userId, role: newRole })
  } catch (err) {
    return handleError(err)
  }
})
