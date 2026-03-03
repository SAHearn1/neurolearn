import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../../utils/supabase/client'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'
import { Spinner } from '../ui/Spinner'
import { ProgressBar } from '../ui/ProgressBar'
import { useParentStudentLinks } from '../../hooks/useParentStudentLinks'

interface StudentReport {
  studentId: string
  studentName: string
  lessonsCompleted: number
  streakDays: number
  courses: { courseId: string; title: string; progressPct: number }[]
}

export function ParentProgressReports() {
  const { activeLinks } = useParentStudentLinks()
  const [reports, setReports] = useState<StudentReport[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReports = useCallback(async () => {
    if (!activeLinks.length) return
    setLoading(true)
    setError(null)

    try {
      const studentIds = activeLinks.map((l) => l.link.student_id)

      const { data: progress } = await supabase
        .from('lesson_progress')
        .select('user_id, course_id, status')
        .in('user_id', studentIds)

      const courseIds = [...new Set((progress ?? []).map((p) => p.course_id))]
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title, lesson_count')
        .in('id', courseIds.length ? courseIds : ['__none__'])

      const courseMap = new Map((courses ?? []).map((c) => [c.id, c]))

      const result: StudentReport[] = activeLinks.map(({ link, student }) => {
        const studentProgress = (progress ?? []).filter((p) => p.user_id === link.student_id)
        const courseGroups = new Map<string, { total: number; completed: number }>()

        for (const sp of studentProgress) {
          const g = courseGroups.get(sp.course_id) ?? { total: 0, completed: 0 }
          g.total += 1
          if (sp.status === 'completed') g.completed += 1
          courseGroups.set(sp.course_id, g)
        }

        return {
          studentId: link.student_id,
          studentName: student.display_name,
          lessonsCompleted: student.lessons_completed,
          streakDays: student.streak_days,
          courses: Array.from(courseGroups.entries()).map(([courseId, g]) => {
            const course = courseMap.get(courseId)
            const denom = course?.lesson_count ?? g.total
            return {
              courseId,
              title: course?.title ?? 'Unknown',
              progressPct: denom > 0 ? Math.round((g.completed / denom) * 100) : 0,
            }
          }),
        }
      })

      setReports(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load reports')
    } finally {
      setLoading(false)
    }
  }, [activeLinks])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const exportReport = useCallback((report: StudentReport) => {
    const headers = ['Course', 'Progress (%)']
    const rows = report.courses.map((c) => [c.title, c.progressPct])

    const csvContent = [
      `Progress Report for ${report.studentName}`,
      `Generated: ${new Date().toLocaleDateString()}`,
      `Lessons Completed: ${report.lessonsCompleted}`,
      `Streak: ${report.streakDays} days`,
      '',
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `progress-${report.studentName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [])

  if (loading) return <Spinner />
  if (error) return <Alert variant="error">{error}</Alert>

  if (!activeLinks.length) {
    return <p className="text-slate-500">Link a student first to see progress reports.</p>
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900">Progress Reports</h2>

      {reports.map((r) => (
        <Card key={r.studentId}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">{r.studentName}</h3>
              <p className="text-sm text-slate-500">
                {r.lessonsCompleted} lessons · {r.streakDays} day streak
              </p>
            </div>
            <Button variant="secondary" onClick={() => exportReport(r)}>
              Export CSV
            </Button>
          </div>
          {r.courses.length > 0 && (
            <div className="mt-3 space-y-2">
              {r.courses.map((c) => (
                <div key={c.courseId}>
                  <p className="text-sm text-slate-600">{c.title}</p>
                  <ProgressBar label={`${c.progressPct}%`} value={c.progressPct} />
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}
    </section>
  )
}
