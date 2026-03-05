import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { LessonViewer } from '../components/lesson/LessonViewer'
import { useLesson, useLessons } from '../hooks/useLessons'
import { useLessonProgress } from '../hooks/useProgress'
import { useAuthStore } from '../store/authStore'
import { useSettingsStore } from '../store/settingsStore'
import { racaFlags } from '../lib/raca/feature-flags'
import { SmartReminders } from '../components/learner/SmartReminders'
import { MilestoneCelebration, checkMilestone } from '../components/learner/MilestoneCelebration'
import type { MilestoneType } from '../components/learner/MilestoneCelebration'
import { useProfile } from '../hooks/useProfile'
import { useTimeTracking } from '../hooks/useTimeTracking'

export function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const { lesson, loading, error } = useLesson(lessonId)
  const { lessons } = useLessons(courseId)
  const user = useAuthStore((s) => s.user)
  const { progress, updateProgress } = useLessonProgress(lessonId)
  const { profile, refetch: refetchProfile } = useProfile()
  const [completing, setCompleting] = useState(false)
  const [milestone, setMilestone] = useState<MilestoneType | null>(null)
  const { getElapsedSeconds } = useTimeTracking()

  const { accessibility, updateAccessibility } = useSettingsStore()
  const isCompleted = progress?.status === 'completed'

  const currentIndex = lessons.findIndex((l) => l.id === lessonId)
  const nextLesson =
    currentIndex >= 0 && currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null
  const lessonNumber = currentIndex >= 0 ? currentIndex + 1 : null
  const totalLessons = lessons.length

  const [completeError, setCompleteError] = useState<string | null>(null)

  const handleMarkComplete = async () => {
    if (!user?.id || !lessonId || !courseId) return
    setCompleting(true)
    setCompleteError(null)
    try {
      await updateProgress({
        user_id: user.id,
        lesson_id: lessonId,
        course_id: courseId,
        status: 'completed',
        time_spent_seconds: getElapsedSeconds(),
      })
      await refetchProfile()
      const newLessonsCompleted = (profile?.lessons_completed ?? 0) + 1
      const streakDays = profile?.streak_days ?? 0
      const courseComplete = nextLesson === null
      const triggered = checkMilestone(newLessonsCompleted, streakDays, courseComplete)
      if (triggered) setMilestone(triggered)
    } catch (err) {
      setCompleteError(
        err instanceof Error ? err.message : 'Failed to save progress. Please try again.',
      )
    } finally {
      setCompleting(false)
    }
  }

  const cycleFontSize = () => {
    const sizes = ['small', 'medium', 'large'] as const
    const idx = sizes.indexOf(accessibility.text_size)
    updateAccessibility({ text_size: sizes[(idx + 1) % sizes.length] })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <main id="main-content" className="mx-auto flex min-h-screen w-full max-w-3xl flex-col">
      {/* Sticky lesson header */}
      <div className="sticky top-0 z-10 -mx-0 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-6 py-3 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            className="flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
            to={`/courses/${courseId}`}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Course
          </Link>

          {lessonNumber !== null && totalLessons > 0 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              {lessonNumber} / {totalLessons}
            </span>
          )}

          {lesson?.duration_minutes && (
            <span className="hidden rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500 sm:inline">
              {lesson.duration_minutes} min
            </span>
          )}

          {isCompleted && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
              ✓ Completed
            </span>
          )}
        </div>

        {/* Accessibility quick-toggles */}
        <div className="flex items-center gap-1" role="group" aria-label="Accessibility options">
          <button
            onClick={cycleFontSize}
            title={`Text size: ${accessibility.text_size}`}
            className="rounded-md px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            A
            {accessibility.text_size === 'small'
              ? '−'
              : accessibility.text_size === 'large'
                ? '+'
                : ''}
          </button>
          <button
            onClick={() => updateAccessibility({ high_contrast: !accessibility.high_contrast })}
            title="Toggle high contrast"
            className={`rounded-md px-2.5 py-1.5 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-brand-500 ${
              accessibility.high_contrast
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            ◑
          </button>
          <button
            onClick={() => updateAccessibility({ dyslexia_font: !accessibility.dyslexia_font })}
            title="Toggle dyslexia font"
            className={`rounded-md px-2.5 py-1.5 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-brand-500 ${
              accessibility.dyslexia_font
                ? 'bg-brand-500 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Aa
          </button>
        </div>
      </div>

      {/* Lesson header */}
      <div className="px-6 pt-8 pb-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-brand-600">
          Lesson
        </p>
        <h1 className="text-3xl font-bold leading-tight text-slate-900">
          {lesson?.title ?? 'Lesson'}
        </h1>
        {lesson?.description && (
          <p className="mt-2 text-base text-slate-500">{lesson.description}</p>
        )}
      </div>

      {/* Alerts */}
      {(error || completeError) && (
        <div className="px-6">
          {error && <Alert variant="error">{error}</Alert>}
          {completeError && <Alert variant="error">{completeError}</Alert>}
        </div>
      )}

      {/* Lesson content — elevated card */}
      {lesson && (
        <div className="mx-6 mb-2 overflow-hidden rounded-2xl bg-white shadow-[0_2px_16px_-4px_rgba(15,23,42,0.08)] ring-1 ring-slate-900/5">
          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-brand-500 to-purple-500" />
          <div className="p-6">
            <LessonViewer lesson={lesson} courseId={courseId} />
            {!lesson.content && (
              <p className="py-8 text-center text-slate-400">
                This lesson is being prepared by your educator. Check back soon.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Actions row */}
      <div className="flex flex-wrap items-center gap-3 px-6 py-4">
        {lesson && !isCompleted && (
          <Button onClick={handleMarkComplete} disabled={completing}>
            {completing ? 'Saving…' : '✓ Mark as Complete'}
          </Button>
        )}
        {isCompleted && nextLesson && (
          <Link to={`/courses/${courseId}/lessons/${nextLesson.id}`}>
            <Button>Next lesson →</Button>
          </Link>
        )}
      </div>

      {/* RACA session CTA — premium feel */}
      {racaFlags.runtime && lesson && (
        <div className="mx-6 mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-50 to-purple-50 ring-1 ring-brand-200">
          <div className="flex items-start gap-4 p-5">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 text-lg text-white shadow-brand">
              🧠
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900">Deep Learning Session</p>
              <p className="mt-0.5 text-sm text-slate-500">
                AI-guided cognitive session that adapts to your thinking style.
              </p>
            </div>
            <Link to={`/courses/${courseId}/lessons/${lessonId}/session`} className="flex-shrink-0">
              <Button variant="secondary" className="whitespace-nowrap">
                Start session
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Lesson navigation */}
      <nav
        className="flex items-center justify-between border-t border-slate-100 px-6 py-5"
        aria-label="Lesson navigation"
      >
        <div>
          {prevLesson ? (
            <Link
              className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-brand-700"
              to={`/courses/${courseId}/lessons/${prevLesson.id}`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              {prevLesson.title}
            </Link>
          ) : (
            <Link
              className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-brand-700"
              to={`/courses/${courseId}`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to course
            </Link>
          )}
        </div>
        <div>
          {nextLesson && (
            <Link
              className="flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
              to={`/courses/${courseId}/lessons/${nextLesson.id}`}
            >
              {nextLesson.title}
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      </nav>

      <SmartReminders />

      {milestone && (
        <MilestoneCelebration milestone={milestone} onDismiss={() => setMilestone(null)} />
      )}
    </main>
  )
}
