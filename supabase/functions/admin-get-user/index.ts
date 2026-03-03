// supabase/functions/admin-get-user/index.ts
// Returns full profile details for a single user.
//
// Method: POST
// Body: { user_id: string }
// Response: { user: UserProfile }

import { authenticate, requireRole } from '../_shared/authz.ts'
import { parseBody, requireUuid } from '../_shared/validate.ts'
import { corsHeaders, json, handleError } from '../_shared/response.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const ctx = await authenticate(req)
    requireRole(ctx, ['admin'])

    const body = await parseBody(req)
    const userId = requireUuid(body, 'user_id')

    const { data: profile, error: profileError } = await ctx.adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (profileError) throw new Error(profileError.message)
    if (!profile) return json({ error: 'User not found' }, 404)

    // Fetch auth user email via admin API.
    const { data: authData, error: authError } = await ctx.adminClient.auth.admin.getUserById(userId)
    const email = authError ? null : authData?.user?.email ?? null

    return json({ user: { ...profile, email } })
  } catch (err) {
    return handleError(err)
  }
})
