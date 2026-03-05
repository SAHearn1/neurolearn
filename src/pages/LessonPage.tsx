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
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-6"
    >
      {/* Sticky lesson header */}
      <div className="sticky top-0 z-10 -mx-6 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-3 shadow-sm backdrop-blur">
        <div className="flex items-center gap-3">
          <Link className="text-sm font-semibold text-brand-700" to={`/courses/${courseId}`}>
            ← Course
          </Link>
          {lesson?.duration_minutes && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {lesson.duration_minutes} min
            </span>
          )}
          {isCompleted && (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
              Completed ✓
            </span>
          )}
        </div>
        {/* Accessibility quick-toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={cycleFontSize}
            title={`Text size: ${accessibility.text_size}`}
            className="rounded px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            A
            {accessibility.text_size === 'small'
              ? '▾'
              : accessibility.text_size === 'large'
                ? '▴'
                : ''}
          </button>
          <button
            onClick={() => updateAccessibility({ high_contrast: !accessibility.high_contrast })}
            title="Toggle high contrast"
            className={`rounded px-2 py-1 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-brand-500 ${
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
            className={`rounded px-2 py-1 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-brand-500 ${
              accessibility.dyslexia_font
                ? 'bg-brand-500 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Aa
          </button>
        </div>
      </div>

      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Lesson</p>
        <h1 className="text-3xl font-bold text-slate-900">{lesson?.title ?? 'Lesson'}</h1>
        {lesson?.description && <p className="mt-1 text-slate-600">{lesson.description}</p>}
      </header>

      {error && <Alert variant="error">{error}</Alert>}
      {completeError && <Alert variant="error">{completeError}</Alert>}

      {lesson && (
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <LessonViewer lesson={lesson} courseId={courseId} />
          {!lesson.content && (
            <p className="leading-relaxed text-slate-500">
              This lesson is being prepared by your educator. Check back soon.
            </p>
          )}
        </article>
      )}

      {/* Mark Complete */}
      {lesson && !isCompleted && (
        <div className="flex items-center gap-3">
          <Button onClick={handleMarkComplete} disabled={completing}>
            {completing ? 'Saving…' : 'Mark as Complete'}
          </Button>
        </div>
      )}

      {racaFlags.runtime && lesson && (
        <div className="rounded-lg border border-brand-200 bg-brand-50 p-4">
          <p className="mb-2 text-sm text-brand-800">
            Ready to engage deeply with this lesson? Start an AI-guided cognitive session.
          </p>
          <Link to={`/courses/${courseId}/lessons/${lessonId}/session`}>
            <Button>Start Learning Session</Button>
          </Link>
        </div>
      )}

      {/* Lesson navigation */}
      <nav className="flex items-center justify-between" aria-label="Lesson navigation">
        <div>
          {prevLesson ? (
            <Link
              className="text-sm font-semibold text-brand-700"
              to={`/courses/${courseId}/lessons/${prevLesson.id}`}
            >
              &larr; {prevLesson.title}
            </Link>
          ) : (
            <Link className="text-sm font-semibold text-brand-700" to={`/courses/${courseId}`}>
              &larr; Back to course
            </Link>
          )}
        </div>
        <div>
          {nextLesson && (
            <Link
              className="text-sm font-semibold text-brand-700"
              to={`/courses/${courseId}/lessons/${nextLesson.id}`}
            >
              {nextLesson.title} &rarr;
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
