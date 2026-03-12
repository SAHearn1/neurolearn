import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLesson } from '../hooks/useLessons'
import { useRacaSession } from '../hooks/useRacaSession'
import { useCognitiveState } from '../hooks/useCognitiveState'
import { useEpistemicProfile } from '../hooks/useEpistemicProfile'
import { useAgent } from '../hooks/useAgent'
import type { AgentSessionPersonalization } from '../hooks/useAgent'
import { racaFlags } from '../lib/raca/feature-flags'
import { getAgentDefinitionsForState } from '../lib/raca/layer2-agent-router/state-agent-map'
import { useRuntimeStore } from '../lib/raca/layer0-runtime/runtime-store'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../../utils/supabase/client'
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
import { SessionModeSelector } from '../components/raca/SessionModeSelector'
import { PriorSessionSummary } from '../components/raca/PriorSessionSummary'
import { BreakOffering } from '../components/raca/BreakOffering'
import { RegulationCheckIn } from '../components/raca/RegulationCheckIn'
import type { RegulationLevel } from '../components/raca/RegulationCheckIn'
import { FormativeCheckIn } from '../components/raca/FormativeCheckIn'
import type { ConfidenceLevel } from '../components/raca/FormativeCheckIn'
import { TransitionAnnouncement } from '../components/raca/TransitionAnnouncement'
import { SessionSummaryCard } from '../components/raca/SessionSummaryCard'
import { DiagnosticBanner } from '../components/raca/DiagnosticBanner'
import { useSessionDiagnostic } from '../hooks/useSessionDiagnostic'
import { Button } from '../components/ui/Button'
import { useSkillEvidence } from '../hooks/useSkillEvidence'
import { useMasteryScoring } from '../hooks/useMasteryScoring'
import { scoreTRACE } from '../lib/raca/layer4-epistemic/fluency-tracker'
import { traceSessionXPBreakdown } from '../lib/xp'
import type { CognitiveState } from '../lib/raca/types/cognitive-states'
import type { ArtifactKind } from '../lib/raca/types/artifacts'

type SelectableMode = 'review' | 'standard' | 'challenge'

/** Artifact kinds that trigger skill evidence extraction */
const EVIDENCE_KINDS: ArtifactKind[] = [
  'draft',
  'revision',
  'defense_response',
  'reconnection_reflection',
]

/** Regulation score below which a break is offered */
const REGULATION_BREAK_THRESHOLD = 30
/** Minimum ms between break offerings */
const BREAK_COOLDOWN_MS = 5 * 60 * 1000

/** Transitions that gate on a RegulationCheckIn (emotional regulation) before proceeding */
const REGULATION_CHECK_IN_TRANSITIONS = new Set<string>(['REGULATE→POSITION', 'APPLY→REVISE'])

/** Transitions that gate on a FormativeCheckIn (comprehension confidence) before proceeding */
const FORMATIVE_CHECK_IN_TRANSITIONS = new Set<string>([
  'POSITION→PLAN',
  'PLAN→APPLY',
  'REVISE→DEFEND',
])

/** All check-in gated transitions */
const CHECK_IN_TRANSITIONS = new Set<string>([
  ...REGULATION_CHECK_IN_TRANSITIONS,
  ...FORMATIVE_CHECK_IN_TRANSITIONS,
])

/** Core RACA session UI — lazily imported by SessionPage when the runtime flag is on */
export function SessionPageCore() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { lesson } = useLesson(lessonId)

  const session = useRacaSession()
  const cognitive = useCognitiveState()
  const epistemic = useEpistemicProfile()

  // AI-09/#323: Session personalization — fetch prior mastery status + TRACE profile
  // so all agent invocations are contextualised for returning learners.
  // #324: also tracks priorMasteryScore + priorDataLoaded for pre-session summary screen.
  const [priorOutcome, setPriorOutcome] =
    useState<AgentSessionPersonalization['priorSessionOutcome']>(undefined)
  const [priorMasteryScore, setPriorMasteryScore] = useState<number | null>(null)
  const [traceProfileData, setTraceProfileData] = useState<Record<string, number> | undefined>(
    undefined,
  )
  const [priorDataLoaded, setPriorDataLoaded] = useState(false)
  const [showPriorSummary, setShowPriorSummary] = useState(false)

  useEffect(() => {
    if (!user?.id || !lessonId) {
      const id = setTimeout(() => setPriorDataLoaded(true), 0)
      return () => clearTimeout(id)
    }
    let cancelled = false

    const fetchPersonalization = async () => {
      const [masteryResult, epistemicResult] = await Promise.all([
        supabase
          .from('lesson_progress')
          .select('mastery_status, score')
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId)
          .maybeSingle(),
        supabase
          .from('epistemic_profiles')
          .select('trace_averages')
          .eq('user_id', user.id)
          .maybeSingle(),
      ])
      if (cancelled) return

      const status = masteryResult.data?.mastery_status as
        | AgentSessionPersonalization['priorSessionOutcome']
        | null
        | undefined
      if (status) {
        setPriorOutcome(status)
        if (status !== 'not_started') setShowPriorSummary(true)
      }

      const score = masteryResult.data?.score as number | null | undefined
      if (typeof score === 'number') setPriorMasteryScore(score)

      const traceAvg = epistemicResult.data?.trace_averages as
        | Record<string, number>
        | null
        | undefined
      if (traceAvg) setTraceProfileData(traceAvg)

      setPriorDataLoaded(true)
    }

    void fetchPersonalization()
    return () => {
      cancelled = true
    }
  }, [user?.id, lessonId])

  const agentPersonalization = useMemo<AgentSessionPersonalization>(
    () => ({
      traceProfile: traceProfileData,
      priorSessionOutcome: priorOutcome,
    }),
    [traceProfileData, priorOutcome],
  )

  const agent = useAgent(agentPersonalization)
  const dispatch = useRuntimeStore((s) => s.dispatch)
  const artifacts = useRuntimeStore((s) => s.artifacts)
  const events = useRuntimeStore((s) => s.events)

  // Issue #321/#322: evidence + mastery hooks (declared before saveArtifact/handleEndSession)
  const { saveEvidence } = useSkillEvidence(session.sessionId ?? '', lessonId)
  const { archiveSession } = useMasteryScoring()

  // ── P21-01: Session mode selection ───────────────────────────────────────
  const [sessionStarted, setSessionStarted] = useState(false)
  const [selectedMode, setSelectedMode] = useState<SelectableMode | null>(null)
  const sessionStartedAtRef = useRef<number | null>(null)

  // ── P21-04: Transition announcement ──────────────────────────────────────
  const prevStateRef = useRef<string | null>(null)
  const [announcement, setAnnouncement] = useState<{ toState: string; visible: boolean }>({
    toState: '',
    visible: false,
  })

  // ── P21-03 / #325: Check-in between transitions ───────────────────────────
  const [checkInPending, setCheckInPending] = useState(false)
  const [checkInType, setCheckInType] = useState<'regulation' | 'formative'>('regulation')
  // Refs hold the actual CognitiveState for callback execution
  const pendingTransitionRef = useRef<CognitiveState | null>(null)
  // State holds display strings (read during render)
  const [pendingFrom, setPendingFrom] = useState('')
  const [pendingTo, setPendingTo] = useState('')

  // ── P21-02: Break offering ────────────────────────────────────────────────
  const [showBreakOffering, setShowBreakOffering] = useState(false)
  const [onBreak, setOnBreak] = useState(false)
  const breakOfferedAtRef = useRef<number | null>(null)

  // ── P21-06: Session summary ───────────────────────────────────────────────
  const [showSummary, setShowSummary] = useState(false)
  const [summaryData, setSummaryData] = useState<{
    completedStates: string[]
    durationMs: number
    wordCount: number
    traceScores: ReturnType<typeof scoreTRACE> | null
  } | null>(null)

  // P21-04: Detect state transitions and show announcement
  useEffect(() => {
    if (!sessionStarted) return
    const current = cognitive.currentState
    if (prevStateRef.current !== null && prevStateRef.current !== current) {
      // Defer to avoid setState-in-effect cascade lint warning
      const id = setTimeout(() => setAnnouncement({ toState: current, visible: true }), 0)
      prevStateRef.current = current
      return () => clearTimeout(id)
    }
    prevStateRef.current = current
  }, [cognitive.currentState, sessionStarted])

  // P21-02: Watch regulation level — offer a break when it falls below threshold
  useEffect(() => {
    if (!sessionStarted || onBreak || showBreakOffering) return
    if (epistemic.regulation.level >= REGULATION_BREAK_THRESHOLD) return
    const now = Date.now()
    if (breakOfferedAtRef.current !== null && now - breakOfferedAtRef.current < BREAK_COOLDOWN_MS) {
      return
    }
    breakOfferedAtRef.current = now
    const id = setTimeout(() => setShowBreakOffering(true), 0)
    return () => clearTimeout(id)
  }, [epistemic.regulation.level, sessionStarted, onBreak, showBreakOffering])

  // P21-01: Mode selected → start session
  const handleModeSelect = useCallback(
    async (mode: SelectableMode) => {
      setSelectedMode(mode)
      await session.start({ lesson_id: lessonId ?? '', course_id: courseId ?? '' })
      sessionStartedAtRef.current = Date.now()
      prevStateRef.current = null // reset so the initial ROOT→first-state fires announcement
      setSessionStarted(true)
    },
    [session, lessonId, courseId],
  )

  // P21-03 / #325: Transition with optional check-in gate
  const handleTransition = useCallback(
    (to: CognitiveState) => {
      const key = `${cognitive.currentState}→${to}`
      if (CHECK_IN_TRANSITIONS.has(key)) {
        pendingTransitionRef.current = to
        setPendingFrom(cognitive.currentState)
        setPendingTo(to)
        setCheckInType(FORMATIVE_CHECK_IN_TRANSITIONS.has(key) ? 'formative' : 'regulation')
        setCheckInPending(true)
        return
      }
      cognitive.transition(to)
    },
    [cognitive],
  )

  // P21-03: Check-in submitted → persist + proceed with transition
  const handleCheckInSelect = useCallback(
    async (level: RegulationLevel) => {
      if (user?.id && session.sessionId) {
        await supabase
          .from('regulation_checkins')
          .insert({ user_id: user.id, session_id: session.sessionId, level })
      }
      setCheckInPending(false)
      const pending = pendingTransitionRef.current
      pendingTransitionRef.current = null
      if (pending) cognitive.transition(pending)
    },
    [user, session.sessionId, cognitive],
  )

  // #325: Formative check-in submitted → persist confidence level + proceed
  const handleFormativeCheckIn = useCallback(
    async (level: ConfidenceLevel) => {
      if (user?.id && session.sessionId) {
        await supabase.from('regulation_checkins').insert({
          user_id: user.id,
          session_id: session.sessionId,
          level,
        })
      }
      setCheckInPending(false)
      const pending = pendingTransitionRef.current
      pendingTransitionRef.current = null
      if (pending) cognitive.transition(pending)
    },
    [user, session.sessionId, cognitive],
  )

  // P21-03 / #325: Skip check-in without persisting
  const handleCheckInSkip = useCallback(() => {
    setCheckInPending(false)
    const pending = pendingTransitionRef.current
    pendingTransitionRef.current = null
    if (pending) cognitive.transition(pending)
  }, [cognitive])

  const saveArtifact = useCallback(
    (kind: ArtifactKind, state: CognitiveState, content: string) => {
      const artifactId = crypto.randomUUID()
      const wordCount = content.trim().split(/\s+/).filter(Boolean).length
      const version = artifacts.filter((a) => a.kind === kind).length + 1
      dispatch({
        type: 'ARTIFACT_SAVED',
        artifact: {
          id: artifactId,
          session_id: session.sessionId ?? '',
          kind,
          state,
          content,
          word_count: wordCount,
          version,
          created_at: new Date().toISOString(),
        },
      })
      // Persist artifact to DB for session history artifact_count
      if (session.sessionId) {
        void supabase.from('raca_artifacts').insert({
          id: artifactId,
          session_id: session.sessionId,
          kind,
          state,
          content,
          word_count: wordCount,
          version,
        })
      }
      epistemic.processMessage(content, [])
      // Issue #321: persist skill evidence for substantive artifact kinds
      if (EVIDENCE_KINDS.includes(kind)) {
        void saveEvidence(content, state, 'system', artifactId)
      }
    },
    [artifacts, dispatch, session.sessionId, epistemic, saveEvidence],
  )

  // P21-06: End session → compute summary → show card before navigating
  const handleEndSession = useCallback(async () => {
    const traceScores = artifacts.length > 0 ? scoreTRACE(artifacts) : null
    const durationMs = sessionStartedAtRef.current ? Date.now() - sessionStartedAtRef.current : 0
    const wordCount = artifacts.reduce((sum, a) => sum + (a.word_count ?? 0), 0)
    setSummaryData({
      completedStates: cognitive.stateHistory,
      durationMs,
      wordCount,
      traceScores,
    })
    // Issue #322: archive mastery score and run CCSS bridge
    if (lessonId) {
      try {
        await archiveSession({
          sessionId: session.sessionId ?? '',
          lessonId,
          statesCompleted: cognitive.stateHistory,
          artifactText: artifacts.map((a) => a.content).join('\n\n'),
          artifacts: artifacts.map((a) => ({
            kind: a.kind,
            content: a.content,
            word_count: a.word_count ?? 0,
          })),
          sessionDurationMs: durationMs,
          traceScores: traceScores ? (traceScores as unknown as Record<string, number>) : undefined,
        })
      } catch {
        // Non-critical — session still ends cleanly
      }
    }
    // Call epistemic-analyze to update LCP (Learner Cognitive Profile) — #348
    if (user?.id && session.sessionId && traceScores) {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData.session?.access_token
        void fetch(`${supabaseUrl}/functions/v1/epistemic-analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            user_id: user.id,
            session_id: session.sessionId,
            artifacts: artifacts.map((a) => ({
              kind: a.kind,
              content: a.content,
              word_count: a.word_count ?? 0,
            })),
            trace_scores: traceScores,
          }),
        })
      } catch {
        // Non-critical — profile update is fire-and-forget
      }
    }
    await session.end(false)
    setShowSummary(true)
  }, [artifacts, cognitive.stateHistory, session, lessonId, archiveSession, user])

  // P21-05: Session diagnostic for personalized start banner
  const { diagnostic } = useSessionDiagnostic(lessonId)

  const availableAgents = getAgentDefinitionsForState(cognitive.currentState)

  const sessionXP = useMemo(() => {
    if (cognitive.currentState !== 'ARCHIVE' || artifacts.length === 0) return null
    const trace = scoreTRACE(artifacts)
    return traceSessionXPBreakdown(trace.overall)
  }, [cognitive.currentState, artifacts])

  // ── P21-01: Pre-session mode selector (with #324 returning-learner summary) ──
  if (!sessionStarted) {
    return (
      <main id="main-content" className="mx-auto flex min-h-screen w-full max-w-2xl flex-col p-6">
        <header className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
            RACA Session
          </p>
          <h1 className="text-2xl font-bold text-slate-900">{lesson?.title ?? 'Loading…'}</h1>
        </header>
        {/* #324: show prior progress summary for returning learners before mode selection */}
        {priorDataLoaded && showPriorSummary && priorOutcome && priorOutcome !== 'not_started' ? (
          <PriorSessionSummary
            lessonTitle={lesson?.title ?? ''}
            priorOutcome={priorOutcome}
            masteryScore={priorMasteryScore}
            traceProfile={traceProfileData}
            onContinue={() => setShowPriorSummary(false)}
          />
        ) : (
          <SessionModeSelector onSelect={handleModeSelect} />
        )}
      </main>
    )
  }

  // ── P21-06: Post-session summary ──────────────────────────────────────────
  if (showSummary && summaryData) {
    return (
      <main
        id="main-content"
        className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6"
      >
        <SessionSummaryCard
          completedStates={summaryData.completedStates}
          sessionDurationMs={summaryData.durationMs}
          artifactWordCount={summaryData.wordCount}
          traceScores={summaryData.traceScores ?? undefined}
        />
        <div className="flex justify-center">
          <Button onClick={() => navigate(`/courses/${courseId}/lessons/${lessonId}`)}>
            Back to lesson
          </Button>
        </div>
      </main>
    )
  }

  // ── P21-02: Break screen ─────────────────────────────────────────────────
  if (onBreak) {
    return (
      <main
        id="main-content"
        className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center gap-4 p-6"
      >
        <p className="text-5xl" aria-hidden="true">
          ☕
        </p>
        <h2 className="text-2xl font-bold text-slate-800">Take a moment</h2>
        <p className="text-sm text-slate-500">
          Step away, breathe, stretch. Come back when you&apos;re ready.
        </p>
        <Button onClick={() => setOnBreak(false)}>Resume session</Button>
      </main>
    )
  }

  return (
    <main id="main-content" className="mx-auto flex min-h-screen w-full max-w-6xl gap-6 p-6">
      {/* P21-04: Transition announcement overlay */}
      <TransitionAnnouncement
        toState={announcement.toState}
        visible={announcement.visible}
        onDone={() => setAnnouncement((a) => ({ ...a, visible: false }))}
      />

      {/* P21-03 / #325: Regulation or formative check-in modal */}
      {checkInPending && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg">
            {checkInType === 'formative' ? (
              <FormativeCheckIn
                fromState={pendingFrom}
                toState={pendingTo}
                onSelect={(level) => void handleFormativeCheckIn(level)}
                onSkip={handleCheckInSkip}
              />
            ) : (
              <div className="space-y-3">
                <RegulationCheckIn onSelect={(level) => void handleCheckInSelect(level)} />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleCheckInSkip}
                    className="text-xs text-slate-400 underline hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    Skip check-in
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col gap-4">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
              RACA Session
              {selectedMode && (
                <span className="ml-2 font-normal normal-case text-slate-400">
                  — {selectedMode}
                </span>
              )}
            </p>
            <h1 className="text-2xl font-bold text-slate-900">{lesson?.title ?? 'Loading…'}</h1>
          </div>
          <Button variant="ghost" onClick={() => void handleEndSession()}>
            End session
          </Button>
        </header>

        <CognitiveStateIndicator
          currentState={cognitive.currentState}
          stateHistory={cognitive.stateHistory}
        />

        {/* P21-05: Personalised diagnostic banner — auto-dismisses after 4s */}
        {diagnostic && <DiagnosticBanner diagnostic={diagnostic} />}

        {/* P21-02: Break offering card */}
        {showBreakOffering && (
          <BreakOffering
            onTakeBreak={() => {
              setShowBreakOffering(false)
              setOnBreak(true)
            }}
            onContinue={() => setShowBreakOffering(false)}
          />
        )}

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
                <div className="mx-auto mb-5 max-w-xs rounded-xl border border-green-200 bg-white px-4 py-3 shadow-sm">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    XP Earned
                  </p>
                  <div className="flex justify-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-lg font-bold text-slate-800">+{sessionXP.base}</p>
                      <p className="text-xs text-slate-500">Session</p>
                    </div>
                    {sessionXP.bonus > 0 && (
                      <>
                        <div className="self-center text-slate-300">+</div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-amber-600">+{sessionXP.bonus}</p>
                          <p className="text-xs text-slate-500">TRACE bonus</p>
                        </div>
                      </>
                    )}
                    <div className="self-center text-slate-300">=</div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-brand-700">+{sessionXP.total} XP</p>
                      <p className="text-xs text-slate-500">Total</p>
                    </div>
                  </div>
                </div>
              )}
              <Button onClick={() => void handleEndSession()}>Finish and return to lesson</Button>
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
