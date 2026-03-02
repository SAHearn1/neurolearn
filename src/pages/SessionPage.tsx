import { lazy, Suspense } from 'react'
import { useParams, Link } from 'react-router-dom'
import { racaFlags } from '../lib/raca/feature-flags'
import { Alert } from '../components/ui/Alert'
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
