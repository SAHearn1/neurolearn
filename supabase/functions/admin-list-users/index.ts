// supabase/functions/admin-list-users/index.ts
// Returns a paginated list of all user profiles.
//
// Method: POST
// Body: { limit?: number; offset?: number; role?: string }
// Response: { users: UserRow[]; total: number }

import { authenticate, requireRole } from '../_shared/authz.ts'
import { parseBody, optionalNumber, optionalString } from '../_shared/validate.ts'
import { corsHeaders, json, handleError } from '../_shared/response.ts'

interface UserRow {
  user_id: string
  display_name: string
  role: string
  streak_days: number
  lessons_completed: number
  created_at: string
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const ctx = await authenticate(req)
    requireRole(ctx, ['admin'])

    const body = await parseBody(req)
    const limit = optionalNumber(body, 'limit', 50)
    const offset = optionalNumber(body, 'offset', 0)
    const roleFilter = optionalString(body, 'role')

    let query = ctx.adminClient
      .from('profiles')
      .select('user_id, display_name, role, streak_days, lessons_completed, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + Math.min(limit, 200) - 1)

    if (roleFilter) {
      query = query.eq('role', roleFilter)
    }

    const { data, error, count } = await query

    if (error) throw new Error(error.message)

    return json({ users: (data ?? []) as UserRow[], total: count ?? 0 })
  } catch (err) {
    return handleError(err)
  }
})
