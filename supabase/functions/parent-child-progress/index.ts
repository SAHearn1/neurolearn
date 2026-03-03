// supabase/functions/parent-child-progress/index.ts
// Returns a child's course progress for an approved parent.
//
// Method: POST
// Body: { student_id: string }
// Response: { courses: CourseProgressSummary[] }

import { authenticate, requireParentOf } from '../_shared/authz.ts'
import { parseBody, requireUuid } from '../_shared/validate.ts'
import { corsHeaders, json, handleError } from '../_shared/response.ts'

interface CourseProgressSummary {
  course_id: string
  title: string
  level: string
  lessons_completed: number
  lessons_total: number
  percent_complete: number
  total_time_seconds: number
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const ctx = await authenticate(req)

    const body = await parseBody(req)
    const studentId = requireUuid(body, 'student_id')

    // Throws 403 if no approved link exists.
    await requireParentOf(ctx, studentId)

    // Fetch all progress rows for the student.
    const { data: progressRows, error: progressError } = await ctx.adminClient
      .from('lesson_progress')
      .select('course_id, status, time_spent_seconds')
      .eq('user_id', studentId)

    if (progressError) throw new Error(progressError.message)

    const byCourse = new Map<string, { completed: number; total: number; time: number }>()
    for (const row of progressRows ?? []) {
      const entry = byCourse.get(row.course_id) ?? { completed: 0, total: 0, time: 0 }
      entry.total += 1
      if (row.status === 'completed') entry.completed += 1
      entry.time += row.time_spent_seconds ?? 0
      byCourse.set(row.course_id, entry)
    }

    if (byCourse.size === 0) return json({ courses: [] })

    const { data: courseRows, error: courseError } = await ctx.adminClient
      .from('courses')
      .select('id, title, level')
      .in('id', [...byCourse.keys()])

    if (courseError) throw new Error(courseError.message)

    const courses: CourseProgressSummary[] = (courseRows ?? []).map((c) => {
      const agg = byCourse.get(c.id) ?? { completed: 0, total: 0, time: 0 }
      return {
        course_id: c.id,
        title: c.title,
        level: c.level,
        lessons_completed: agg.completed,
        lessons_total: agg.total,
        percent_complete: agg.total > 0 ? Math.round((agg.completed / agg.total) * 100) : 0,
        total_time_seconds: agg.time,
      }
    })

    return json({ courses })
  } catch (err) {
    return handleError(err)
  }
})
