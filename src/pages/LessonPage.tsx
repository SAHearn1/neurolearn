import { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { LessonViewer } from '../components/lesson/LessonViewer'
import { useLesson, useLessons } from '../hooks/useLessons'
import { useLessonProgress, useCourseProgress } from '../hooks/useProgress'
import { useAuthStore } from '../store/authStore'
import { useSettingsStore } from '../store/settingsStore'
import { racaFlags } from '../lib/raca/feature-flags'
import { SmartReminders } from '../components/learner/SmartReminders'
import { MilestoneCelebration, checkMilestone } from '../components/learner/MilestoneCelebration'
import type { MilestoneType } from '../components/learner/MilestoneCelebration'
import { useProfile } from '../hooks/useProfile'
import { useTimeTracking } from '../hooks/useTimeTracking'
import { useAdaptiveLearning } from '../hooks/useAdaptiveLearning'
import { notifyParents } from '../lib/milestoneNotifier'

function LessonOutlineDrawer({
  courseId,
  currentLessonId,
  open,
  onClose,
}: {
  courseId: string | undefined
  currentLessonId: string | undefined
  open: boolean
  onClose: () => void
}) {
  const { lessons } = useLessons(courseId)
  const { progress: courseProgress } = useCourseProgress(courseId)
  const drawerRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Focus trap: focus first element when opening
  useEffect(() => {
    if (open) drawerRef.current?.focus()
  }, [open])

  if (!open) return null

  const completed = courseProgress?.completed_lessons ?? 0
  const total = courseProgress?.total_lessons ?? lessons.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Course outline"
        className="fixed inset-y-0 left-0 z-50 flex w-80 max-w-[90vw] flex-col bg-white shadow-2xl outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-900">Course Outline</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close course outline"
            className="rounded-md p-1 text-slate-400 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress summary */}
        <div className="border-b border-slate-100 px-4 py-3">
          <div className="mb-1.5 flex items-center justify-between text-xs text-slate-500">
            <span>
              {completed} of {total} lessons
            </span>
            <span>{pct}% complete</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Lesson list */}
        <ol className="flex-1 overflow-y-auto py-2">
          {lessons.map((lesson, idx) => {
            const isCurrent = lesson.id === currentLessonId
            return (
              <li key={lesson.id}>
                <Link
                  to={`/courses/${courseId}/lessons/${lesson.id}`}
                  onClick={onClose}
                  className={`flex items-start gap-3 px-4 py-3 text-sm transition-colors hover:bg-slate-50 ${
                    isCurrent ? 'border-l-2 border-brand-500 bg-brand-50' : ''
                  }`}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      isCurrent ? 'bg-brand-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isCurrent ? '▶' : idx + 1}
                  </span>
                  <span
                    className={`leading-snug ${isCurrent ? 'font-semibold text-brand-700' : 'text-slate-700'}`}
                  >
                    {lesson.title}
                  </span>
                </Link>
              </li>
            )
          })}
        </ol>
      </div>
    </>
  )
}

export function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const { lesson, loading, error } = useLesson(lessonId)
  const { lessons } = useLessons(courseId)
  const user = useAuthStore((s) => s.user)
  const { progress, updateProgress } = useLessonProgress(lessonId)
  const { profile, refetch: refetchProfile } = useProfile()
  const [completing, setCompleting] = useState(false)
  const [milestone, setMilestone] = useState<MilestoneType | null>(null)
  const [outlineOpen, setOutlineOpen] = useState(false)
  const { getElapsedSeconds } = useTimeTracking()
  const { state: adaptiveState } = useAdaptiveLearning(courseId)

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
      if (triggered) {
        setMilestone(triggered)
        if (user?.id) {
          void notifyParents(user.id, triggered, {
            lessonTitle: lesson?.title,
            courseTitle: undefined,
          })
        }
      }
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
          {/* Outline toggle */}
          <button
            type="button"
            onClick={() => setOutlineOpen(true)}
            aria-label="Open course outline"
            aria-expanded={outlineOpen}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <span className="hidden sm:inline">Outline</span>
          </button>

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

        {/* Mastery pill */}
        {adaptiveState?.mastery_score != null && (
          <span
            title="Your mastery score for this course — updates as you complete lessons."
            className="hidden rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-200 sm:inline"
          >
            🎯 {adaptiveState.mastery_score}% mastery
          </span>
        )}

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

        {adaptiveState?.current_difficulty && adaptiveState.current_difficulty !== 'adaptive' && (
          <span
            title="This lesson's difficulty is calibrated based on your recent performance."
            className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
              adaptiveState.current_difficulty === 'easy'
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                : adaptiveState.current_difficulty === 'medium'
                  ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
                  : 'bg-purple-50 text-purple-700 ring-1 ring-purple-200'
            }`}
          >
            Calibrated: {adaptiveState.current_difficulty}
          </span>
        )}

        {lesson?.learning_objectives && lesson.learning_objectives.length > 0 && (
          <details
            className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 open:pb-4"
            open
          >
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-emerald-800 [&::-webkit-details-marker]:hidden">
              <span className="flex items-center gap-2">
                <span>By the end of this lesson you will be able to:</span>
                <svg
                  className="h-4 w-4 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <ul className="mt-2 space-y-1.5 px-4" aria-label="Learning objectives for this lesson">
              {lesson.learning_objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-emerald-900">
                  <span
                    className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-emerald-200 text-[10px] font-bold text-emerald-800"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                  {obj}
                </li>
              ))}
            </ul>
          </details>
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

      <LessonOutlineDrawer
        courseId={courseId}
        currentLessonId={lessonId}
        open={outlineOpen}
        onClose={() => setOutlineOpen(false)}
      />

      <SmartReminders />

      {milestone && (
        <MilestoneCelebration milestone={milestone} onDismiss={() => setMilestone(null)} />
      )}
    </main>
  )
}
