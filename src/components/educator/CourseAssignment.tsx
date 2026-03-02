import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../../utils/supabase/client'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'
import { Spinner } from '../ui/Spinner'
import { useClassManagement } from '../../hooks/useClassManagement'
import type { Course } from '../../types/course'

interface AssignmentRecord {
  id: string
  user_id: string
  course_id: string
  enrolled_at: string
  course_title: string
  student_name: string
}

export function CourseAssignment() {
  const { classes } = useClassManagement()
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [enrolledStudents, setEnrolledStudents] = useState<{ student_id: string; display_name: string }[]>([])
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch available courses
  useEffect(() => {
    supabase
      .from('courses')
      .select('*')
      .eq('status', 'published')
      .then(({ data }) => {
        if (data) setCourses(data as Course[])
      })
  }, [])

  // Fetch enrolled students and their course assignments when class is selected
  const fetchClassData = useCallback(async (classId: string) => {
    setLoading(true)
    setError(null)
    try {
      const { data: enrollments, error: enrollErr } = await supabase
        .from('class_enrollments')
        .select('student_id')
        .eq('class_id', classId)

      if (enrollErr) throw enrollErr

      const studentIds = (enrollments ?? []).map((e) => e.student_id)
      if (!studentIds.length) {
        setEnrolledStudents([])
        setAssignments([])
        return
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', studentIds)

      setEnrolledStudents(
        (profiles ?? []).map((p) => ({
          student_id: p.user_id,
          display_name: p.display_name ?? 'Student',
        })),
      )

      const { data: courseEnrollments } = await supabase
        .from('course_enrollments')
        .select('id, user_id, course_id, enrolled_at')
        .in('user_id', studentIds)

      const records: AssignmentRecord[] = (courseEnrollments ?? []).map((ce) => ({
        id: ce.id,
        user_id: ce.user_id,
        course_id: ce.course_id,
        enrolled_at: ce.enrolled_at,
        course_title: courses.find((c) => c.id === ce.course_id)?.title ?? 'Unknown',
        student_name: (profiles ?? []).find((p) => p.user_id === ce.user_id)?.display_name ?? 'Student',
      }))

      setAssignments(records)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }, [courses])

  useEffect(() => {
    if (selectedClassId) fetchClassData(selectedClassId)
  }, [selectedClassId, fetchClassData])

  const assignCourse = useCallback(
    async (studentId: string, courseId: string) => {
      setError(null)
      try {
        const { error: err } = await supabase
          .from('course_enrollments')
          .insert({ user_id: studentId, course_id: courseId })

        if (err) throw err
        if (selectedClassId) await fetchClassData(selectedClassId)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to assign course')
      }
    },
    [selectedClassId, fetchClassData],
  )

  const unassignCourse = useCallback(
    async (assignmentId: string) => {
      setError(null)
      try {
        const { error: err } = await supabase
          .from('course_enrollments')
          .delete()
          .eq('id', assignmentId)

        if (err) throw err
        if (selectedClassId) await fetchClassData(selectedClassId)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to remove assignment')
      }
    },
    [selectedClassId, fetchClassData],
  )

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900">Course Assignments</h2>

      {classes.length === 0 ? (
        <p className="text-slate-500">Create a class first to assign courses.</p>
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

          {!loading && selectedClassId && enrolledStudents.length === 0 && (
            <p className="text-slate-500">No students in this class.</p>
          )}

          {!loading && enrolledStudents.length > 0 && (
            <div className="space-y-4">
              {enrolledStudents.map((student) => {
                const studentAssignments = assignments.filter((a) => a.user_id === student.student_id)
                const assignedCourseIds = new Set(studentAssignments.map((a) => a.course_id))
                const unassignedCourses = courses.filter((c) => !assignedCourseIds.has(c.id))

                return (
                  <Card key={student.student_id}>
                    <h3 className="font-semibold text-slate-900">{student.display_name}</h3>

                    {studentAssignments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm font-medium text-slate-600">Assigned:</p>
                        {studentAssignments.map((a) => (
                          <div key={a.id} className="flex items-center justify-between text-sm">
                            <span className="text-slate-700">{a.course_title}</span>
                            <Button variant="ghost" onClick={() => unassignCourse(a.id)}>
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {unassignedCourses.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-slate-600">Available:</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {unassignedCourses.map((c) => (
                            <Button
                              key={c.id}
                              variant="secondary"
                              onClick={() => assignCourse(student.student_id, c.id)}
                            >
                              + {c.title}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}
    </section>
  )
}
