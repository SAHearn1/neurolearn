import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useRacaSession } from '../hooks/useRacaSession'
import { useCognitiveState } from '../hooks/useCognitiveState'
import { useEpistemicProfile } from '../hooks/useEpistemicProfile'
import { useAgent } from '../hooks/useAgent'
import { useAuthStore } from '../store/authStore'
import { useProgressStore } from '../store/progressStore'
import { racaFlags } from '../lib/raca/feature-flags'
import { getAgentDefinitionsForState } from '../lib/raca/layer2-agent-router/state-agent-map'
import { useRuntimeStore } from '../lib/raca/layer0-runtime/runtime-store'
import { restoreSessionLocal } from '../lib/raca/layer0-runtime/persistence'
import { CognitiveStateIndicator } from '../components/raca/CognitiveStateIndicator'
import { StateTransitionBar } from '../components/raca/StateTransitionBar'
import { ReflectionPrompt } from '../components/raca/ReflectionPrompt'
import { DraftEditor } from '../components/raca/DraftEditor'
import { AgentPanel } from '../components/raca/AgentPanel'
import { RevisionView } from '../components/raca/RevisionView'
import { DefensePanel } from '../components/raca/DefensePanel'
import { EpistemicDashboard } from '../components/raca/EpistemicDashboard'
import { RegulationIntervention } from '../components/raca/RegulationIntervention'
import { AuditTimeline } from '../components/raca/AuditTimeline'
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
  const navigate = useNavigate()

  const session = useRacaSession()
  const cognitive = useCognitiveState()
  const epistemic = useEpistemicProfile()
  const agent = useAgent()
  const user = useAuthStore((s) => s.user)
  const updateLessonProgress = useProgressStore((s) => s.updateLessonProgress)
  const dispatch = useRuntimeStore((s) => s.dispatch)
  const artifacts = useRuntimeStore((s) => s.artifacts)
  const events = useRuntimeStore((s) => s.events)
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
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-4 p-6">
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

  const handleTransition = (to: CognitiveState) => {
    const result = cognitive.transition(to)
    if (!result.success) {
      // Error is shown via the hint mechanism
    }
  }

  const saveArtifact = (kind: ArtifactKind, state: CognitiveState, content: string) => {
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length
    const version = artifacts.filter((a) => a.kind === kind).length + 1
    dispatch({
      type: 'ARTIFACT_SAVED',
      artifact: {
        id: crypto.randomUUID(),
        session_id: session.sessionId ?? '',
        kind,
        state,
        content,
        word_count: wordCount,
        version,
        created_at: new Date().toISOString(),
      },
    })
    epistemic.processMessage(content, [])
    // Auto-persist to localStorage after every artifact save
    session.save()
  }

  const handleEndSession = async () => {
    if (user?.id && lessonId && courseId) {
      await updateLessonProgress({
        user_id: user.id,
        lesson_id: lessonId,
        course_id: courseId,
        status: 'completed',
      })
    }
    await session.end(false)
    navigate(`/courses/${courseId}/lessons/${lessonId}`)
  }

  const availableAgents = getAgentDefinitionsForState(cognitive.currentState)

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
