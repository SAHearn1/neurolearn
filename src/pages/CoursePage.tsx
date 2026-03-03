import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert } from '../components/ui/Alert'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { useCourse } from '../hooks/useCourses'
import { useLessons } from '../hooks/useLessons'
import { useEnrollment } from '../hooks/useEnrollment'
import { useLessonProgress, useCourseProgress } from '../hooks/useProgress'

function LessonCard({ courseId, lessonId, index, title, description }: {
  courseId: string; lessonId: string; index: number; title: string; description?: string
}) {
  const { progress } = useLessonProgress(lessonId)
  const statusLabel = progress?.status === 'completed' ? 'Completed' : progress?.status === 'in_progress' ? 'In progress' : null

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4" key={lessonId}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Lesson {index + 1}</p>
        {statusLabel && (
          <Badge>{statusLabel}</Badge>
        )}
      </div>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      <Link className="mt-2 inline-block text-sm font-semibold text-brand-700" to={`/courses/${courseId}/lessons/${lessonId}`}>
        {progress?.status === 'completed' ? 'Review lesson' : 'Start lesson'} &rarr;
      </Link>
    </article>
  )
}

export function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { course, loading: courseLoading, error: courseError } = useCourse(courseId)
  const { lessons, loading: lessonsLoading, error: lessonsError } = useLessons(courseId)
  const { isEnrolled, loading: enrollLoading, enroll } = useEnrollment(courseId)
  const { progress: courseProgress } = useCourseProgress(courseId)
  const [enrolling, setEnrolling] = useState(false)

  if (courseLoading || lessonsLoading || enrollLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <main id="main-content" className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 p-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Course</p>
        <h1 className="text-3xl font-bold text-slate-900">{course?.title ?? 'Course'}</h1>
        {course?.description && (
          <p className="mt-2 text-slate-600">{course.description}</p>
        )}
      </header>

      {(courseError || lessonsError) && (
        <Alert variant="error">{courseError ?? lessonsError}</Alert>
      )}

      {!isEnrolled && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="mb-2 text-sm text-amber-800">You are not enrolled in this course.</p>
          <Button
            disabled={enrolling}
            onClick={async () => {
              setEnrolling(true)
              try { await enroll() } finally { setEnrolling(false) }
            }}
          >
            {enrolling ? 'Enrolling…' : 'Enroll in this course'}
          </Button>
        </div>
      )}

      {isEnrolled && courseProgress && (
        <p className="text-sm text-slate-500">
          Progress: {courseProgress.completed_lessons}/{courseProgress.total_lessons} lessons completed ({courseProgress.percent_complete}%)
        </p>
      )}

      {lessons.length === 0 && !lessonsError && (
        <p className="text-slate-500">No lessons available yet for this course.</p>
      )}

      {isEnrolled && (
        <section className="space-y-3">
          {lessons.map((lesson, index) => (
            <LessonCard
              key={lesson.id}
              courseId={courseId!}
              lessonId={lesson.id}
              index={index}
              title={lesson.title}
              description={lesson.description}
            />
          ))}
        </section>
      )}

      <div>
        <Link className="text-sm font-semibold text-brand-700" to="/courses">
          &larr; Back to courses
        </Link>
      </div>
    </main>
  )
}
