// supabase/functions/admin-analytics-summary/index.ts
// Returns platform-wide analytics for the admin dashboard.
//
// Method: GET or POST (no body required)
// Response: { totals, recent_activity, role_breakdown }

import { authenticate, requireRole } from '../_shared/authz.ts'
import { corsHeaders, json, handleError } from '../_shared/response.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const ctx = await authenticate(req)
    requireRole(ctx, ['admin'])

    // Run all aggregation queries in parallel.
    const [
      usersResult,
      coursesResult,
      lessonsResult,
      progressResult,
      enrollmentsResult,
    ] = await Promise.all([
      ctx.adminClient.from('profiles').select('role', { count: 'exact' }),
      ctx.adminClient.from('courses').select('status', { count: 'exact' }),
      ctx.adminClient.from('lessons').select('status', { count: 'exact' }),
      ctx.adminClient
        .from('lesson_progress')
        .select('status', { count: 'exact' })
        .eq('status', 'completed'),
      ctx.adminClient.from('course_enrollments').select('id', { count: 'exact' }),
    ])

    // Role breakdown.
    const roleBreakdown: Record<string, number> = {}
    for (const row of usersResult.data ?? []) {
      roleBreakdown[row.role] = (roleBreakdown[row.role] ?? 0) + 1
    }

    // Course status breakdown.
    const coursesByStatus: Record<string, number> = {}
    for (const row of coursesResult.data ?? []) {
      coursesByStatus[row.status] = (coursesByStatus[row.status] ?? 0) + 1
    }

    // 7-day window for recent activity.
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count: recentCompletions } = await ctx.adminClient
      .from('lesson_progress')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('completed_at', sevenDaysAgo)

    const { count: newUsers } = await ctx.adminClient
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo)

    return json({
      totals: {
        users: usersResult.count ?? 0,
        courses: coursesResult.count ?? 0,
        lessons: lessonsResult.count ?? 0,
        completions: progressResult.count ?? 0,
        enrollments: enrollmentsResult.count ?? 0,
      },
      role_breakdown: roleBreakdown,
      course_status_breakdown: coursesByStatus,
      last_7_days: {
        new_users: newUsers ?? 0,
        lesson_completions: recentCompletions ?? 0,
      },
    })
  } catch (err) {
    return handleError(err)
  }
})
