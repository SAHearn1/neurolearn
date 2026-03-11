import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLesson } from '../hooks/useLessons'
import { useRacaSession } from '../hooks/useRacaSession'
import { useCognitiveState } from '../hooks/useCognitiveState'
import { useEpistemicProfile } from '../hooks/useEpistemicProfile'
import { useAgent } from '../hooks/useAgent'
import { racaFlags } from '../lib/raca/feature-flags'
import { getAgentDefinitionsForState } from '../lib/raca/layer2-agent-router/state-agent-map'
import { useRuntimeStore } from '../lib/raca/layer0-runtime/runtime-store'
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
import { Button } from '../components/ui/Button'
import { scoreTRACE } from '../lib/raca/layer4-epistemic/fluency-tracker'
import { traceSessionXPBreakdown } from '../lib/xp'
import type { CognitiveState } from '../lib/raca/types/cognitive-states'
import type { ArtifactKind } from '../lib/raca/types/artifacts'

/** Core RACA session UI — lazily imported by SessionPage when the runtime flag is on */
export function SessionPageCore() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const navigate = useNavigate()
  const { lesson } = useLesson(lessonId)

  const session = useRacaSession()
  const cognitive = useCognitiveState()
  const epistemic = useEpistemicProfile()
  const agent = useAgent()
  const dispatch = useRuntimeStore((s) => s.dispatch)
  const artifacts = useRuntimeStore((s) => s.artifacts)
  const events = useRuntimeStore((s) => s.events)

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
  }

  const handleEndSession = async () => {
    await session.end(false)
    navigate(`/courses/${courseId}/lessons/${lessonId}`)
  }

  const availableAgents = getAgentDefinitionsForState(cognitive.currentState)

  const sessionXP = useMemo(() => {
    if (cognitive.currentState !== 'ARCHIVE' || artifacts.length === 0) return null
    const trace = scoreTRACE(artifacts)
    return traceSessionXPBreakdown(trace.overall)
  }, [cognitive.currentState, artifacts])

  return (
    <main id="main-content" className="mx-auto flex min-h-screen w-full max-w-6xl gap-6 p-6">
      {/* Main content */}
      <div className="flex flex-1 flex-col gap-4">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
              RACA Session
            </p>
            <h1 className="text-2xl font-bold text-slate-900">{lesson?.title ?? 'Loading…'}</h1>
          </div>
          <Button variant="ghost" onClick={handleEndSession}>
            End session
          </Button>
        </header>

        <CognitiveStateIndicator
          currentState={cognitive.currentState}
          stateHistory={cognitive.stateHistory}
        />

        {/* State-specific content areas */}
        <div className="space-y-4">
          {cognitive.currentState === 'ROOT' && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h2 className="mb-2 font-semibold text-amber-900">Ground yourself</h2>
              <p className="text-sm text-amber-800">
                Before we begin, take a moment to connect with what you already know about this
                topic. Think about what interests you and what questions you might have.
              </p>
              <div className="mt-3">
                <Button onClick={() => handleTransition('REGULATE')}>I am ready to begin</Button>
              </div>
            </div>
          )}

          {cognitive.currentState === 'REGULATE' && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h2 className="mb-2 font-semibold text-blue-900">Regulation check</h2>
              <p className="mb-3 text-sm text-blue-800">
                On a scale of 1-10, how ready do you feel to learn right now? It is okay if the
                answer is low — we can adjust.
              </p>
              <ReflectionPrompt
                prompt="How are you feeling right now? What is on your mind as you start this session?"
                onSubmit={(text) => {
                  saveArtifact('reflection', 'REGULATE', text)
                  handleTransition('POSITION')
                }}
                minWords={5}
              />
            </div>
          )}

          {cognitive.currentState === 'POSITION' && (
            <ReflectionPrompt
              prompt="How would you frame this problem or question? What do you think is being asked, and why does it matter?"
              onSubmit={(text) => {
                saveArtifact('position_frame', 'POSITION', text)
                handleTransition('PLAN')
              }}
              minWords={10}
            />
          )}

          {cognitive.currentState === 'PLAN' && (
            <DraftEditor
              label="Outline your plan — what steps will you take to address this question?"
              onSave={(content) => {
                saveArtifact('plan_outline', 'PLAN', content)
                handleTransition('APPLY')
              }}
              placeholder="Step 1: ... Step 2: ..."
            />
          )}

          {cognitive.currentState === 'APPLY' && (
            <DraftEditor
              label="Build your draft response"
              onSave={(content) => {
                saveArtifact('draft', 'APPLY', content)
                handleTransition('REVISE')
              }}
              placeholder="Write your response here..."
            />
          )}

          {cognitive.currentState === 'REVISE' && (
            <RevisionView
              originalDraft={artifacts.find((a) => a.kind === 'draft')}
              onSaveRevision={(content) => {
                saveArtifact('revision', 'REVISE', content)
                handleTransition('DEFEND')
              }}
            />
          )}

          {cognitive.currentState === 'DEFEND' && (
            <DefensePanel
              agentQuestions={agent.lastResponse}
              onSubmitDefense={(content) => {
                saveArtifact('defense_response', 'DEFEND', content)
                handleTransition('RECONNECT')
              }}
            />
          )}

          {cognitive.currentState === 'RECONNECT' && (
            <ReflectionPrompt
              prompt="Reflect on what you learned. How has your thinking changed? What connections can you make to other ideas?"
              onSubmit={(text) => {
                saveArtifact('reconnection_reflection', 'RECONNECT', text)
                handleTransition('ARCHIVE')
              }}
              minWords={15}
            />
          )}

          {cognitive.currentState === 'ARCHIVE' && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
              <div className="mb-2 text-4xl">🏆</div>
              <h2 className="mb-1 text-xl font-bold text-green-900">Session complete!</h2>
              <p className="mb-4 text-sm text-green-800">
                You produced {artifacts.length} artifacts across {cognitive.stateHistory.length}{' '}
                states.
              </p>
              {sessionXP && (
                <div className="mb-5 mx-auto max-w-xs rounded-xl bg-white border border-green-200 px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                    XP Earned
                  </p>
                  <div className="flex justify-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-800">+{sessionXP.base}</p>
                      <p className="text-xs text-slate-500">Session</p>
                    </div>
                    {sessionXP.bonus > 0 && (
                      <>
                        <div className="text-slate-300 self-center">+</div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-amber-600">+{sessionXP.bonus}</p>
                          <p className="text-xs text-slate-500">TRACE bonus</p>
                        </div>
                      </>
                    )}
                    <div className="text-slate-300 self-center">=</div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-brand-700">+{sessionXP.total} XP</p>
                      <p className="text-xs text-slate-500">Total</p>
                    </div>
                  </div>
                </div>
              )}
              <Button onClick={handleEndSession}>Finish and return to lesson</Button>
            </div>
          )}

          {/* Agent panel — shown when agents are available */}
          {availableAgents.length > 0 && racaFlags.agents && (
            <AgentPanel
              agents={availableAgents}
              onInvoke={agent.invoke}
              loading={agent.loading}
              lastResponse={agent.lastResponse}
              error={agent.error}
            />
          )}
        </div>

        <StateTransitionBar
          currentState={cognitive.currentState}
          nextStates={cognitive.nextStates}
          onTransition={handleTransition}
          disabled={cognitive.currentState === 'ARCHIVE'}
        />
      </div>

      {/* Sidebar */}
      <aside className="hidden w-72 flex-shrink-0 space-y-4 lg:block">
        {racaFlags.epistemicMonitoring && (
          <EpistemicDashboard
            trace={epistemic.trace}
            regulation={epistemic.regulation}
            adaptationLevel={epistemic.adaptationLevel}
          />
        )}

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <AuditTimeline events={events} maxItems={15} />
        </div>
      </aside>

      {/* Regulation intervention overlay */}
      {epistemic.isIntervening && (
        <RegulationIntervention
          regulationLevel={epistemic.regulation.level}
          onDismiss={epistemic.dismissIntervention}
        />
      )}
    </main>
  )
}
