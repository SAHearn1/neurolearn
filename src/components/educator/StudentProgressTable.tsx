import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../../utils/supabase/client'
import { Card } from '../ui/Card'
import { Alert } from '../ui/Alert'
import { Spinner } from '../ui/Spinner'
import { ProgressBar } from '../ui/ProgressBar'
import { useClassManagement } from '../../hooks/useClassManagement'
import { STATE_METADATA } from '../../lib/raca/types/cognitive-states'
import type { CognitiveState } from '../../lib/raca/types/cognitive-states'

const FIVE_R_COLORS: Record<string, string> = {
  Relate: 'bg-blue-100 text-blue-700',
  Regulate: 'bg-amber-100 text-amber-700',
  Reason: 'bg-brand-100 text-brand-700',
  Repair: 'bg-purple-100 text-purple-700',
  Restore: 'bg-green-100 text-green-700',
}

interface StudentProgress {
  student_id: string
  display_name: string
  lessons_completed: number
  streak_days: number
  courses: { course_id: string; title: string; progress_pct: number }[]
  /** Current 5Rs phase derived from active cognitive session (#328) */
  currentFiveR: string | null
  activeSessionState: string | null
}

export function StudentProgressTable() {
  const { classes, loading: classesLoading } = useClassManagement()
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [students, setStudents] = useState<StudentProgress[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStudentProgress = useCallback(async (classId: string) => {
    setLoading(true)
    setError(null)
    try {
      // Get enrolled students
      const { data: enrollments, error: enrollErr } = await supabase
        .from('class_enrollments')
        .select('student_id')
        .eq('class_id', classId)

      if (enrollErr) throw enrollErr
      if (!enrollments?.length) {
        setStudents([])
        return
      }

      const studentIds = enrollments.map((e) => e.student_id)

      // Get profiles
      const { data: profiles, error: profErr } = await supabase
        .from('profiles')
        .select('user_id, display_name, lessons_completed, streak_days')
        .in('user_id', studentIds)

      if (profErr) throw profErr

      // Get lesson progress per student per course
      const { data: progress, error: progErr } = await supabase
        .from('lesson_progress')
        .select('user_id, course_id, status')
        .in('user_id', studentIds)

      if (progErr) throw progErr

      // Get course titles
      const courseIds = [...new Set((progress ?? []).map((p) => p.course_id))]
      const { data: courses } = await supabase
        .from('courses')
        .select('id, title, lesson_count')
        .in('id', courseIds.length ? courseIds : ['__none__'])

      // Get active sessions for 5Rs phase (#328)
      const { data: activeSessions } = await supabase
        .from('cognitive_sessions')
        .select('user_id, current_state')
        .in('user_id', studentIds)
        .eq('status', 'active')
        .order('updated_at', { ascending: false })

      const activeSessionMap = new Map<string, string>()
      for (const s of activeSessions ?? []) {
        if (!activeSessionMap.has(s.user_id)) {
          activeSessionMap.set(s.user_id, s.current_state)
        }
      }

      const courseMap = new Map((courses ?? []).map((c) => [c.id, c]))

      const result: StudentProgress[] = (profiles ?? []).map((p) => {
        const studentProgress = (progress ?? []).filter((pr) => pr.user_id === p.user_id)
        const courseGroups = new Map<string, { total: number; completed: number }>()

        for (const sp of studentProgress) {
          const group = courseGroups.get(sp.course_id) ?? { total: 0, completed: 0 }
          group.total += 1
          if (sp.status === 'completed') group.completed += 1
          courseGroups.set(sp.course_id, group)
        }

        const courseProgressList = Array.from(courseGroups.entries()).map(([courseId, g]) => {
          const course = courseMap.get(courseId)
          const denominator = course?.lesson_count ?? g.total
          return {
            course_id: courseId,
            title: course?.title ?? 'Unknown Course',
            progress_pct: denominator > 0 ? Math.round((g.completed / denominator) * 100) : 0,
          }
        })

        const activeState = activeSessionMap.get(p.user_id) ?? null
        const fiveR =
          activeState && activeState in STATE_METADATA
            ? STATE_METADATA[activeState as CognitiveState].fiveRMapping
            : null

        return {
          student_id: p.user_id,
          display_name: p.display_name ?? 'Student',
          lessons_completed: p.lessons_completed ?? 0,
          streak_days: p.streak_days ?? 0,
          courses: courseProgressList,
          currentFiveR: fiveR,
          activeSessionState: activeState,
        }
      })

      setStudents(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load student progress')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedClassId) {
      fetchStudentProgress(selectedClassId)
    }
  }, [selectedClassId, fetchStudentProgress])

  if (classesLoading) return <Spinner />

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900">Student Progress</h2>

      {classes.length === 0 ? (
        <p className="text-slate-500">Create a class first to track student progress.</p>
      ) : (
        <>
          <div className="flex gap-2">
            {classes.map((cls) => (
              <button
                key={cls.id}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  selectedClassId === cls.id
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                onClick={() => setSelectedClassId(cls.id)}
              >
                {cls.name}
              </button>
            ))}
          </div>

          {error && <Alert variant="error">{error}</Alert>}

          {loading && <Spinner />}

          {!loading && selectedClassId && students.length === 0 && (
            <p className="text-slate-500">No students enrolled in this class yet.</p>
          )}

          {!loading && students.length > 0 && (
            <div className="space-y-3">
              {students.map((s) => (
                <Card key={s.student_id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-900">{s.display_name}</h3>
                      <p className="text-sm text-slate-500">
                        {s.lessons_completed} lessons completed · {s.streak_days} day streak
                      </p>
                    </div>
                    {s.currentFiveR && (
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${FIVE_R_COLORS[s.currentFiveR] ?? 'bg-slate-100 text-slate-600'}`}
                        title={`5Rs phase: ${s.currentFiveR} (${s.activeSessionState ?? ''})`}
                        aria-label={`Currently in ${s.currentFiveR} phase`}
                      >
                        {s.currentFiveR}
                      </span>
                    )}
                  </div>
                  {s.courses.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {s.courses.map((c) => (
                        <div key={c.course_id}>
                          <p className="text-sm text-slate-600">{c.title}</p>
                          <ProgressBar label={`${c.progress_pct}%`} value={c.progress_pct} />
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}
