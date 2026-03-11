import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../../utils/supabase/client'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'
import { Spinner } from '../ui/Spinner'
import { useClassManagement } from '../../hooks/useClassManagement'

interface ClassAnalytics {
  classId: string
  className: string
  totalStudents: number
  avgLessonsCompleted: number
  avgStreakDays: number
  completionRates: { courseTitle: string; rate: number }[]
}

export function EducatorAnalytics() {
  const { classes } = useClassManagement()
  const [analytics, setAnalytics] = useState<ClassAnalytics[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    if (!classes.length) return
    setLoading(true)
    setError(null)

    try {
      const results: ClassAnalytics[] = []

      for (const cls of classes) {
        const { data: enrollments } = await supabase
          .from('class_enrollments')
          .select('student_id')
          .eq('class_id', cls.id)

        const studentIds = (enrollments ?? []).map((e) => e.student_id)
        if (!studentIds.length) {
          results.push({
            classId: cls.id,
            className: cls.name,
            totalStudents: 0,
            avgLessonsCompleted: 0,
            avgStreakDays: 0,
            completionRates: [],
          })
          continue
        }

        const { data: profiles } = await supabase
          .from('profiles')
          .select('lessons_completed, streak_days')
          .in('user_id', studentIds)

        const avgLessons =
          (profiles ?? []).reduce((sum, p) => sum + (p.lessons_completed ?? 0), 0) /
          (profiles?.length || 1)
        const avgStreak =
          (profiles ?? []).reduce((sum, p) => sum + (p.streak_days ?? 0), 0) /
          (profiles?.length || 1)

        const { data: progress } = await supabase
          .from('lesson_progress')
          .select('user_id, course_id, status')
          .in('user_id', studentIds)

        const courseGroups = new Map<string, { total: number; completed: number }>()
        for (const p of progress ?? []) {
          const g = courseGroups.get(p.course_id) ?? { total: 0, completed: 0 }
          g.total += 1
          if (p.status === 'completed') g.completed += 1
          courseGroups.set(p.course_id, g)
        }

        const courseIds = [...courseGroups.keys()]
        const { data: courses } = await supabase
          .from('courses')
          .select('id, title')
          .in('id', courseIds.length ? courseIds : ['00000000-0000-0000-0000-000000000000'])

        const courseMap = new Map((courses ?? []).map((c) => [c.id, c.title]))

        const completionRates = Array.from(courseGroups.entries()).map(([courseId, g]) => ({
          courseTitle: courseMap.get(courseId) ?? 'Unknown',
          rate: g.total > 0 ? Math.round((g.completed / g.total) * 100) : 0,
        }))

        results.push({
          classId: cls.id,
          className: cls.name,
          totalStudents: studentIds.length,
          avgLessonsCompleted: Math.round(avgLessons),
          avgStreakDays: Math.round(avgStreak),
          completionRates,
        })
      }

      setAnalytics(results)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [classes])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const exportCSV = useCallback(() => {
    const headers = ['Class', 'Total Students', 'Avg Lessons Completed', 'Avg Streak Days']
    const rows = analytics.map((a) => [
      a.className,
      a.totalStudents,
      a.avgLessonsCompleted,
      a.avgStreakDays,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `educator-analytics-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [analytics])

  if (loading) return <Spinner />
  if (error) return <Alert variant="error">{error}</Alert>

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Analytics & Reporting</h2>
        <Button variant="secondary" onClick={exportCSV} disabled={analytics.length === 0}>
          Export CSV
        </Button>
      </div>

      {analytics.length === 0 ? (
        <p className="text-slate-500">No analytics data available yet.</p>
      ) : (
        <div className="space-y-4">
          {analytics.map((a) => (
            <Card key={a.classId}>
              <h3 className="font-semibold text-slate-900">{a.className}</h3>
              <div className="mt-2 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Students</p>
                  <p className="text-xl font-bold text-slate-900">{a.totalStudents}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Avg Lessons</p>
                  <p className="text-xl font-bold text-slate-900">{a.avgLessonsCompleted}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Avg Streak</p>
                  <p className="text-xl font-bold text-slate-900">{a.avgStreakDays} days</p>
                </div>
              </div>
              {a.completionRates.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-slate-600">Course Completion Rates</p>
                  <div className="mt-1 space-y-1">
                    {a.completionRates.map((cr) => (
                      <div
                        key={cr.courseTitle}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-slate-700">{cr.courseTitle}</span>
                        <span className="font-semibold text-slate-900">{cr.rate}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
