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
import { MasteryCheckSession } from '../components/raca/MasteryCheckSession'
import { XP_PER_LESSON } from '../lib/xp'
import type { CourseLevel } from '../types/course'

function PathNode({
  courseId,
  lessonId,
  index,
  title,
  description,
  isLast,
}: {
  courseId: string
  lessonId: string
  index: number
  title: string
  description?: string
  isLast: boolean
}) {
  const { progress } = useLessonProgress(lessonId)
  const status = progress?.status ?? 'not_started'

  const isCompleted = status === 'completed'
  const isInProgress = status === 'in_progress'
  const isHere = isInProgress

  const buttonLabel = isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start'
  const buttonVariant = isCompleted ? 'ghost' : 'primary'

  return (
    <li className="relative flex gap-5">
      {/* Vertical connector line (skip for last item) */}
      {!isLast && (
        <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-slate-200" aria-hidden="true" />
      )}

      {/* Node column */}
      <div className="flex flex-col items-center flex-shrink-0">
        {/* Large path node circle */}
        <div
          className={`relative flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold shadow-md transition-transform duration-200 ${
            isCompleted
              ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
              : isInProgress
                ? 'bg-gradient-to-br from-brand-500 to-purple-600 text-white ring-4 ring-brand-100'
                : 'border-2 border-slate-200 bg-white text-slate-400'
          }`}
          aria-hidden="true"
        >
          {isCompleted ? '✓' : isInProgress ? '▶' : <span className="text-sm">{index + 1}</span>}
          {/* Pulse ring for current lesson */}
          {isHere && (
            <span className="absolute inset-0 rounded-full animate-ping bg-brand-400 opacity-25" />
          )}
        </div>
      </div>

      {/* Content card */}
      <div
        className={`mb-5 flex-1 rounded-2xl border p-4 transition-all duration-200 ${
          isCompleted
            ? 'border-emerald-100 bg-emerald-50/60'
            : isInProgress
              ? 'border-brand-200 bg-white shadow-card-hover ring-1 ring-brand-100'
              : 'border-slate-200 bg-white'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Lesson {index + 1}
              </p>
              {isHere && (
                <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  YOU ARE HERE
                </span>
              )}
              {isCompleted && (
                <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                  DONE
                </span>
              )}
            </div>
            <h2 className="mt-0.5 text-base font-semibold text-slate-900 leading-snug">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-slate-500 line-clamp-2">{description}</p>
            )}
            {/* XP reward chip */}
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
              ⭐ +{XP_PER_LESSON} XP
            </span>
          </div>
          <Link to={`/courses/${courseId}/lessons/${lessonId}`} className="flex-shrink-0">
            <Button variant={buttonVariant} className="text-sm">
              {buttonLabel}
            </Button>
          </Link>
        </div>
      </div>
    </li>
  )
}

function CompletionTrophy({ total }: { total: number }) {
  return (
    <li className="relative flex gap-5">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-xl shadow-md ring-4 ring-amber-100">
          🏆
        </div>
      </div>
      <div className="mb-5 flex-1 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4">
        <p className="font-bold text-amber-900">Course Complete!</p>
        <p className="text-sm text-amber-700 mt-0.5">
          Finish all {total} lessons to earn your badge and +{total * XP_PER_LESSON} XP
        </p>
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
  const [masteryCheckOpen, setMasteryCheckOpen] = useState(false)
  const [masteryCheckResult, setMasteryCheckResult] = useState<'passed' | 'failed' | null>(null)

  if (courseLoading || lessonsLoading || enrollLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  const level = (course?.level ?? 'beginner') as CourseLevel
  const completed = courseProgress?.completed_lessons ?? 0
  const total = lessons.length || courseProgress?.total_lessons || 0

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
            <h2 className="mb-4 text-lg font-bold text-slate-900">Learning Path</h2>
            <ol className="space-y-0">
              {lessons.map((lesson, index) => (
                <PathNode
                  key={lesson.id}
                  courseId={courseId!}
                  lessonId={lesson.id}
                  index={index}
                  title={lesson.title}
                  description={lesson.description}
                  isLast={index === lessons.length - 1}
                />
              ))}
              <CompletionTrophy total={lessons.length} />
            </ol>
          </section>
        )}

        {/* #326: Summative course mastery check — shown when all lessons are complete */}
        {isEnrolled && completed >= total && total > 0 && lessons.length > 0 && (
          <section
            aria-labelledby="course-mastery-heading"
            className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-purple-50 p-6"
          >
            <h2 id="course-mastery-heading" className="mb-1 text-lg font-bold text-brand-900">
              Course Mastery Check
            </h2>
            <p className="mb-4 text-sm text-brand-700">
              You&apos;ve completed all lessons. Prove your mastery with a summative response —
              explain the core ideas of this course in your own words.
            </p>

            {masteryCheckResult === 'passed' && (
              <div
                role="status"
                aria-live="polite"
                className="rounded-xl border border-green-200 bg-green-50 p-4 text-center"
              >
                <p className="font-semibold text-green-800">Course mastery confirmed! 🎓</p>
                <p className="mt-1 text-sm text-green-700">
                  Outstanding work — you&apos;ve demonstrated deep understanding.
                </p>
              </div>
            )}

            {masteryCheckResult === 'failed' && (
              <div
                role="status"
                aria-live="polite"
                className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center"
              >
                <p className="font-semibold text-amber-800">
                  Keep reviewing — you&apos;ll get there
                </p>
                <p className="mt-1 text-sm text-amber-700">
                  Return after more practice and try again in 24 hours.
                </p>
              </div>
            )}

            {masteryCheckResult === null && !masteryCheckOpen && (
              <Button
                onClick={() => setMasteryCheckOpen(true)}
                aria-label="Start course mastery check"
              >
                Start mastery check
              </Button>
            )}

            {masteryCheckOpen && masteryCheckResult === null && (
              <MasteryCheckSession
                courseId={courseId!}
                lessonId={lessons[lessons.length - 1].id}
                onComplete={(passed) => {
                  setMasteryCheckResult(passed ? 'passed' : 'failed')
                  setMasteryCheckOpen(false)
                }}
              />
            )}
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
