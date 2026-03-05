import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert } from '../components/ui/Alert'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { GradientThumbnail } from '../components/ui/GradientThumbnail'
import { Spinner } from '../components/ui/Spinner'
import { useCourse } from '../hooks/useCourses'
import { useLessons } from '../hooks/useLessons'
import { useEnrollment } from '../hooks/useEnrollment'
import { useLessonProgress, useCourseProgress } from '../hooks/useProgress'
import type { CourseLevel } from '../types/course'

function TimelineLesson({
  courseId,
  lessonId,
  index,
  title,
  description,
}: {
  courseId: string
  lessonId: string
  index: number
  title: string
  description?: string
}) {
  const { progress } = useLessonProgress(lessonId)
  const status = progress?.status ?? 'not_started'

  const isCompleted = status === 'completed'
  const isInProgress = status === 'in_progress'

  const circleClass = isCompleted
    ? 'bg-emerald-500 text-white border-emerald-500'
    : isInProgress
      ? 'bg-brand-500 text-white border-brand-500'
      : 'bg-white text-slate-400 border-slate-200'

  const buttonLabel = isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start'

  return (
    <li className="relative flex gap-4">
      {/* Connector line */}
      <div className="absolute left-4 top-9 bottom-0 w-px bg-slate-200" aria-hidden="true" />

      {/* Circle indicator */}
      <div
        className={`relative z-10 mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${circleClass}`}
        aria-hidden="true"
      >
        {isCompleted ? '✓' : isInProgress ? '●' : '○'}
      </div>

      {/* Content */}
      <div className="flex-1 pb-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-slate-400">Lesson {index + 1}</p>
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            {description && (
              <p className="mt-0.5 text-sm text-slate-500 line-clamp-2">{description}</p>
            )}
          </div>
          <Link to={`/courses/${courseId}/lessons/${lessonId}`} className="flex-shrink-0">
            <Button variant="secondary" className="text-sm">
              {buttonLabel}
            </Button>
          </Link>
        </div>
      </div>
    </li>
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

  const level = (course?.level ?? 'beginner') as CourseLevel
  const completed = courseProgress?.completed_lessons ?? 0
  const total = courseProgress?.total_lessons ?? lessons.length

  return (
    <main id="main-content" className="mx-auto w-full max-w-4xl flex flex-col gap-6 pb-12">
      {/* Course header banner */}
      <header className="relative overflow-hidden rounded-b-2xl">
        <GradientThumbnail level={level} className="!h-44 !rounded-none" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
          <div className="flex items-end justify-between gap-4">
            <div>
              <Badge className="mb-2 border-white/30 bg-white/20 text-white">{level}</Badge>
              <h1 className="text-3xl font-bold drop-shadow">{course?.title ?? 'Course'}</h1>
              {course?.description && (
                <p className="mt-1 max-w-lg text-sm opacity-90">{course.description}</p>
              )}
            </div>
            {isEnrolled && total > 0 && (
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-bold">
                  {completed}/{total}
                </p>
                <p className="text-xs opacity-80">lessons done</p>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="px-6 flex flex-col gap-6">
        {(courseError || lessonsError) && (
          <Alert variant="error">{courseError ?? lessonsError}</Alert>
        )}

        {!isEnrolled && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <p className="mb-3 text-sm font-medium text-amber-800">
              You are not enrolled in this course yet.
            </p>
            <Button
              disabled={enrolling}
              onClick={async () => {
                setEnrolling(true)
                try {
                  await enroll()
                } finally {
                  setEnrolling(false)
                }
              }}
            >
              {enrolling ? 'Enrolling…' : 'Enroll in this course'}
            </Button>
          </div>
        )}

        {lessons.length === 0 && !lessonsError && (
          <p className="text-slate-500">No lessons available yet for this course.</p>
        )}

        {isEnrolled && lessons.length > 0 && (
          <section aria-label="Lessons">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Lessons</h2>
            <ol className="space-y-0">
              {lessons.map((lesson, index) => (
                <TimelineLesson
                  key={lesson.id}
                  courseId={courseId!}
                  lessonId={lesson.id}
                  index={index}
                  title={lesson.title}
                  description={lesson.description}
                />
              ))}
            </ol>
          </section>
        )}

        <div>
          <Link className="text-sm font-semibold text-brand-700" to="/courses">
            ← Back to courses
          </Link>
        </div>
      </div>
    </main>
  )
}
