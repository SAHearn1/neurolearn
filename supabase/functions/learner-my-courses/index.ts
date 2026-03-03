// supabase/functions/learner-my-courses/index.ts
// Returns the list of courses the authenticated learner is enrolled in,
// enriched with current progress data.
//
// Method: GET (no body required)
// Response: { courses: EnrolledCourse[] }

import { authenticate } from '../_shared/authz.ts'
import { corsHeaders, json, handleError } from '../_shared/response.ts'

interface EnrolledCourse {
  course_id: string
  title: string
  description: string
  level: string
  thumbnail_url: string | null
  lesson_count: number
  enrolled_at: string
  lessons_completed: number
  percent_complete: number
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const ctx = await authenticate(req)

    // Fetch enrolments with joined course metadata.
    const { data: enrollments, error: enrollError } = await ctx.adminClient
      .from('course_enrollments')
      .select(`
        course_id,
        enrolled_at,
        courses (
          id,
          title,
          description,
          level,
          thumbnail_url,
          lesson_count
        )
      `)
      .eq('user_id', ctx.userId)
      .order('enrolled_at', { ascending: false })

    if (enrollError) throw new Error(enrollError.message)
    if (!enrollments || enrollments.length === 0) return json({ courses: [] })

    // Fetch completed lesson counts per course in one query.
    const courseIds = enrollments.map((e) => e.course_id)
    const { data: progressRows, error: progressError } = await ctx.adminClient
      .from('lesson_progress')
      .select('course_id')
      .eq('user_id', ctx.userId)
      .eq('status', 'completed')
      .in('course_id', courseIds)

    if (progressError) throw new Error(progressError.message)

    const completedByCourse = new Map<string, number>()
    for (const row of progressRows ?? []) {
      completedByCourse.set(row.course_id, (completedByCourse.get(row.course_id) ?? 0) + 1)
    }

    const courses: EnrolledCourse[] = enrollments.map((e) => {
      const c = e.courses as {
        id: string; title: string; description: string
        level: string; thumbnail_url: string | null; lesson_count: number
      }
      const completed = completedByCourse.get(e.course_id) ?? 0
      const total = c.lesson_count ?? 0
      return {
        course_id: e.course_id,
        title: c.title,
        description: c.description,
        level: c.level,
        thumbnail_url: c.thumbnail_url,
        lesson_count: total,
        enrolled_at: e.enrolled_at,
        lessons_completed: completed,
        percent_complete: total > 0 ? Math.round((completed / total) * 100) : 0,
      }
    })

    return json({ courses })
  } catch (err) {
    return handleError(err)
  }
})
