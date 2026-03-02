import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../../utils/supabase/client'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Alert } from '../ui/Alert'
import { Spinner } from '../ui/Spinner'
import { Badge } from '../ui/Badge'
import type { Course } from '../../types/course'
import type { Lesson } from '../../types/lesson'

type ContentTab = 'courses' | 'lessons'

export function ContentManager() {
  const [tab, setTab] = useState<ContentTab>('courses')
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Course form state
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [courseTitle, setCourseTitle] = useState('')
  const [courseDesc, setCourseDesc] = useState('')

  // Lesson form state
  const [showLessonForm, setShowLessonForm] = useState(false)
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonDesc, setLessonDesc] = useState('')
  const [lessonContent, setLessonContent] = useState('')

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error: err } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err
      setCourses((data as Course[]) ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load courses')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchLessons = useCallback(async (courseId: string) => {
    setLoading(true)
    try {
      const { data, error: err } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('sort_order', { ascending: true })

      if (err) throw err
      setLessons((data as Lesson[]) ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load lessons')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  useEffect(() => {
    if (selectedCourseId) fetchLessons(selectedCourseId)
  }, [selectedCourseId, fetchLessons])

  const createCourse = useCallback(async () => {
    if (!courseTitle.trim()) return
    setError(null)
    try {
      const { error: err } = await supabase.from('courses').insert({
        title: courseTitle.trim(),
        description: courseDesc.trim() || null,
        status: 'draft',
        level: 'beginner',
        lesson_count: 0,
      })

      if (err) throw err
      setCourseTitle('')
      setCourseDesc('')
      setShowCourseForm(false)
      await fetchCourses()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create course')
    }
  }, [courseTitle, courseDesc, fetchCourses])

  const updateCourseStatus = useCallback(
    async (courseId: string, status: 'draft' | 'published' | 'archived') => {
      setError(null)
      try {
        const { error: err } = await supabase
          .from('courses')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', courseId)

        if (err) throw err
        await fetchCourses()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to update course')
      }
    },
    [fetchCourses],
  )

  const createLesson = useCallback(async () => {
    if (!selectedCourseId || !lessonTitle.trim()) return
    setError(null)
    try {
      const nextOrder = lessons.length + 1
      const { error: err } = await supabase.from('lessons').insert({
        course_id: selectedCourseId,
        title: lessonTitle.trim(),
        description: lessonDesc.trim() || null,
        content: lessonContent.trim() || null,
        sort_order: nextOrder,
        status: 'draft',
        type: 'text',
        duration_minutes: 15,
      })

      if (err) throw err
      setLessonTitle('')
      setLessonDesc('')
      setLessonContent('')
      setShowLessonForm(false)
      await fetchLessons(selectedCourseId)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create lesson')
    }
  }, [selectedCourseId, lessonTitle, lessonDesc, lessonContent, lessons.length, fetchLessons])

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Content Management</h2>
        <div className="flex gap-2">
          <button
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              tab === 'courses' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
            onClick={() => setTab('courses')}
          >
            Courses
          </button>
          <button
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              tab === 'lessons' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
            }`}
            onClick={() => setTab('lessons')}
          >
            Lessons
          </button>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {loading && <Spinner />}

      {tab === 'courses' && (
        <div className="space-y-3">
          <Button onClick={() => setShowCourseForm(!showCourseForm)}>
            {showCourseForm ? 'Cancel' : 'New Course'}
          </Button>

          {showCourseForm && (
            <Card>
              <div className="space-y-3">
                <Input label="Course Title" value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} />
                <Input label="Description" value={courseDesc} onChange={(e) => setCourseDesc(e.target.value)} />
                <Button onClick={createCourse} disabled={!courseTitle.trim()}>Create Course</Button>
              </div>
            </Card>
          )}

          {courses.map((course) => (
            <Card key={course.id}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{course.title}</h3>
                    <Badge>{course.status}</Badge>
                  </div>
                  {course.description && <p className="text-sm text-slate-500">{course.description}</p>}
                  <p className="text-xs text-slate-400">{course.lesson_count} lessons</p>
                </div>
                <div className="flex gap-2">
                  {course.status === 'draft' && (
                    <Button variant="secondary" onClick={() => updateCourseStatus(course.id, 'published')}>
                      Publish
                    </Button>
                  )}
                  {course.status === 'published' && (
                    <Button variant="secondary" onClick={() => updateCourseStatus(course.id, 'archived')}>
                      Archive
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedCourseId(course.id)
                      setTab('lessons')
                    }}
                  >
                    Manage Lessons
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === 'lessons' && (
        <div className="space-y-3">
          {!selectedCourseId ? (
            <p className="text-slate-500">Select a course to manage its lessons.</p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-600">
                  Lessons for: {courses.find((c) => c.id === selectedCourseId)?.title}
                </p>
                <Button onClick={() => setShowLessonForm(!showLessonForm)}>
                  {showLessonForm ? 'Cancel' : 'New Lesson'}
                </Button>
              </div>

              {showLessonForm && (
                <Card>
                  <div className="space-y-3">
                    <Input label="Lesson Title" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} />
                    <Input label="Description" value={lessonDesc} onChange={(e) => setLessonDesc(e.target.value)} />
                    <label className="block text-sm font-medium text-slate-700">
                      Content
                      <textarea
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
                        rows={6}
                        value={lessonContent}
                        onChange={(e) => setLessonContent(e.target.value)}
                      />
                    </label>
                    <Button onClick={createLesson} disabled={!lessonTitle.trim()}>Create Lesson</Button>
                  </div>
                </Card>
              )}

              {lessons.length === 0 && !loading && (
                <p className="text-slate-500">No lessons yet for this course.</p>
              )}

              {lessons.map((lesson) => (
                <Card key={lesson.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-400">#{lesson.sort_order}</span>
                        <h3 className="font-semibold text-slate-900">{lesson.title}</h3>
                        <Badge>{lesson.status}</Badge>
                        <Badge>{lesson.type}</Badge>
                      </div>
                      {lesson.description && <p className="text-sm text-slate-500">{lesson.description}</p>}
                      <p className="text-xs text-slate-400">{lesson.duration_minutes} min</p>
                    </div>
                  </div>
                </Card>
              ))}
            </>
          )}
        </div>
      )}
    </section>
  )
}
