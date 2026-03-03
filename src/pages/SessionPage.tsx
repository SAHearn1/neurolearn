import { lazy, Suspense, useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useRacaSession } from '../hooks/useRacaSession'
import { racaFlags } from '../lib/raca/feature-flags'
import { restoreSessionLocal } from '../lib/raca/layer0-runtime/persistence'
import { useRuntimeStore } from '../lib/raca/layer0-runtime/runtime-store'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'

/**
 * Lazily import the full RACA session UI only when the runtime flag is on.
 * When the flag is off, this file + its fallback UI is the only code loaded —
 * the entire RACA layer stays out of the user's bundle.
 */
const SessionPageCore = lazy(() =>
  import('./SessionPageCore').then((m) => ({ default: m.SessionPageCore })),
)

export function SessionPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const navigate = useNavigate()

  const session = useRacaSession()
  const dispatch = useRuntimeStore((s) => s.dispatch)
  const [showRecovery, setShowRecovery] = useState(false)

  // Check for interrupted session on mount
  useEffect(() => {
    if (!session.isActive && courseId && lessonId) {
      const saved = restoreSessionLocal()
      if (saved && saved.lesson_id === lessonId && saved.status === 'active') {
        setShowRecovery(true)
      } else {
        session.start({ lesson_id: lessonId, course_id: courseId })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, lessonId])

  if (showRecovery) {
    return (
      <main id="main-content" className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-4 p-6">
        <Alert variant="info">You have an interrupted session for this lesson. Would you like to resume?</Alert>
        <div className="flex gap-3">
          <Button onClick={() => {
            const saved = restoreSessionLocal()
            if (saved) {
              dispatch({ type: 'SESSION_RESTORED', state: saved })
            }
            setShowRecovery(false)
          }}>
            Resume session
          </Button>
          <Button variant="secondary" onClick={() => {
            session.start({ lesson_id: lessonId!, course_id: courseId! })
            setShowRecovery(false)
          }}>
            Start fresh
          </Button>
        </div>
      </main>
    )
  }

  if (!racaFlags.runtime) {
    return (
      <main id="main-content" className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-4 p-6">
        <Alert variant="info">
          RACA sessions are not enabled. Enable VITE_RACA_ENABLE_RUNTIME in your environment.
        </Alert>
        <Link to={`/courses/${courseId}/lessons/${lessonId}`} className="text-sm text-brand-700">
          Back to lesson
        </Link>
      </main>
    )
  }

  // Navigate away if session ends (handled in SessionPageCore's end callback)
  void navigate

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <SessionPageCore />
    </Suspense>
  )
}
