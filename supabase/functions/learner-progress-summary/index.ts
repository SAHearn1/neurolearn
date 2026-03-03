// supabase/functions/learner-progress-summary/index.ts
// Returns a summary of the authenticated learner's progress across all enrolled courses.
//
// Method: GET (no body required)
// Response: { courses: CourseProgressSummary[] }

import { authenticate } from '../_shared/authz.ts'
import { corsHeaders, json, handleError } from '../_shared/response.ts'

interface LessonProgressRow {
  status: string
  time_spent_seconds: number | null
  course_id: string
}

interface CourseProgressSummary {
  course_id: string
  title: string
  level: string
  lessons_total: number
  lessons_completed: number
  percent_complete: number
  total_time_seconds: number
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const ctx = await authenticate(req)

    // Fetch all lesson_progress rows for this user in a single query.
    const { data: progressRows, error: progressError } = await ctx.adminClient
      .from('lesson_progress')
      .select('status, time_spent_seconds, course_id')
      .eq('user_id', ctx.userId)

    if (progressError) throw new Error(progressError.message)

    const rows = (progressRows ?? []) as LessonProgressRow[]

    // Aggregate per course.
    const byCourse = new Map<string, { completed: number; total: number; time: number }>()
    for (const row of rows) {
      const entry = byCourse.get(row.course_id) ?? { completed: 0, total: 0, time: 0 }
      entry.total += 1
      if (row.status === 'completed') entry.completed += 1
      entry.time += row.time_spent_seconds ?? 0
      byCourse.set(row.course_id, entry)
    }

    if (byCourse.size === 0) {
      return json({ courses: [] })
    }

    // Fetch course metadata for the courses the user has progress in.
    const courseIds = [...byCourse.keys()]
    const { data: courseRows, error: courseError } = await ctx.adminClient
      .from('courses')
      .select('id, title, level')
      .in('id', courseIds)

    if (courseError) throw new Error(courseError.message)

    const summary: CourseProgressSummary[] = (courseRows ?? []).map((c) => {
      const agg = byCourse.get(c.id) ?? { completed: 0, total: 0, time: 0 }
      return {
        course_id: c.id,
        title: c.title,
        level: c.level,
        lessons_total: agg.total,
        lessons_completed: agg.completed,
        percent_complete: agg.total > 0 ? Math.round((agg.completed / agg.total) * 100) : 0,
        total_time_seconds: agg.time,
      }
    })

    return json({ courses: summary })
  } catch (err) {
    return handleError(err)
  }
})
