// supabase/functions/parent-weekly-report/index.ts
// Generates a weekly learning summary for a child, for their approved parent.
// Covers the 7 days ending at midnight UTC today.
//
// Method: POST
// Body: { student_id: string }
// Response: { student_id, week_start, week_end, lessons_completed, time_seconds, streaks, courses_active }

import { authenticate, requireParentOf } from '../_shared/authz.ts'
import { parseBody, requireUuid } from '../_shared/validate.ts'
import { corsHeaders, json, handleError } from '../_shared/response.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const ctx = await authenticate(req)

    const body = await parseBody(req)
    const studentId = requireUuid(body, 'student_id')

    await requireParentOf(ctx, studentId)

    // Define the 7-day window (last 7 full days, inclusive).
    const now = new Date()
    const weekEnd = new Date(now)
    weekEnd.setUTCHours(23, 59, 59, 999)
    const weekStart = new Date(weekEnd)
    weekStart.setUTCDate(weekStart.getUTCDate() - 6)
    weekStart.setUTCHours(0, 0, 0, 0)

    // Fetch completed lessons in the window.
    const { data: completedRows, error: completedError } = await ctx.adminClient
      .from('lesson_progress')
      .select('course_id, time_spent_seconds, completed_at')
      .eq('user_id', studentId)
      .eq('status', 'completed')
      .gte('completed_at', weekStart.toISOString())
      .lte('completed_at', weekEnd.toISOString())

    if (completedError) throw new Error(completedError.message)

    const rows = completedRows ?? []
    const totalLessons = rows.length
    const totalTime = rows.reduce((sum, r) => sum + (r.time_spent_seconds ?? 0), 0)

    // Unique courses active this week.
    const coursesActive = [...new Set(rows.map((r) => r.course_id))].length

    // Active days (days on which at least one lesson was completed).
    const activeDays = new Set(
      rows.map((r) => new Date(r.completed_at).toISOString().slice(0, 10)),
    ).size

    // Fetch student's current streak from their profile.
    const { data: profile } = await ctx.adminClient
      .from('profiles')
      .select('streak_days, display_name')
      .eq('user_id', studentId)
      .maybeSingle()

    return json({
      student_id: studentId,
      student_name: profile?.display_name ?? null,
      week_start: weekStart.toISOString(),
      week_end: weekEnd.toISOString(),
      lessons_completed: totalLessons,
      time_seconds: totalTime,
      active_days: activeDays,
      courses_active: coursesActive,
      current_streak_days: profile?.streak_days ?? 0,
    })
  } catch (err) {
    return handleError(err)
  }
})
