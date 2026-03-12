/**
 * EducatorStudentDetailPage — educator view of a single student.
 * Shows 5Rs session timeline, TRACE profile, and CCSS standards evidence.
 * Issue #330.
 */

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../utils/supabase/client'
import { Spinner } from '../components/ui/Spinner'
import { EducatorStandardsView } from '../components/educator/EducatorStandardsView'
import { STATE_METADATA } from '../lib/raca/types/cognitive-states'
import type { CognitiveState } from '../lib/raca/types/cognitive-states'

type Tab = 'timeline' | 'trace' | 'standards'

interface SessionEntry {
  id: string
  current_state: string
  status: string
  session_mode: string | null
  started_at: string
  updated_at: string
  lesson_id: string | null
  lesson_title: string | null
  mastery_score: number | null
  mastery_status: string | null
  fiveRPhase: string | null
}

interface TraceAverages {
  think?: number
  reason?: number
  articulate?: number
  check?: number
  extend?: number
  ethical?: number
}

const FIVE_R_COLORS: Record<string, string> = {
  Relate: 'bg-blue-100 text-blue-700 border-blue-200',
  Regulate: 'bg-amber-100 text-amber-700 border-amber-200',
  Reason: 'bg-brand-100 text-brand-700 border-brand-200',
  Repair: 'bg-purple-100 text-purple-700 border-purple-200',
  Restore: 'bg-green-100 text-green-700 border-green-200',
}

const MASTERY_COLORS: Record<string, string> = {
  proficient: 'text-green-700',
  in_progress: 'text-amber-700',
  developing: 'text-orange-700',
  not_started: 'text-slate-400',
}

const TRACE_LABELS: Record<string, string> = {
  think: 'Think',
  reason: 'Reason',
  articulate: 'Articulate',
  check: 'Check',
  extend: 'Extend',
  ethical: 'Ethical',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function TraceBar({ label, score }: { label: string; score: number }) {
  const pct = Math.round((score / 10) * 100)
  const color = score >= 7 ? 'bg-green-400' : score >= 4 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="text-slate-500">{score.toFixed(1)}/10</span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-label={`${label}: ${score.toFixed(1)} out of 10`}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function EducatorStudentDetailPage() {
  const { studentId } = useParams<{ studentId: string }>()
  const navigate = useNavigate()

  const [studentName, setStudentName] = useState<string>('Student')
  const [sessions, setSessions] = useState<SessionEntry[]>([])
  const [traceAverages, setTraceAverages] = useState<TraceAverages | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('timeline')

  useEffect(() => {
    if (!studentId) return
    let cancelled = false

    const load = async () => {
      setLoading(true)

      const [profileRes, sessionsRes, epistemicRes] = await Promise.all([
        supabase.from('profiles').select('display_name').eq('user_id', studentId).maybeSingle(),
        supabase
          .from('cognitive_sessions')
          .select('id, current_state, status, session_mode, started_at, updated_at, lesson_id')
          .eq('user_id', studentId)
          .order('started_at', { ascending: false })
          .limit(20),
        supabase
          .from('epistemic_profiles')
          .select('trace_averages')
          .eq('user_id', studentId)
          .maybeSingle(),
      ])

      if (cancelled) return

      setStudentName(profileRes.data?.display_name ?? 'Student')
      setTraceAverages(
        (epistemicRes.data?.trace_averages as TraceAverages | null | undefined) ?? null,
      )

      const rawSessions = sessionsRes.data ?? []
      if (rawSessions.length === 0) {
        setSessions([])
        setLoading(false)
        return
      }

      // Fetch lesson titles and mastery scores
      const lessonIds = [
        ...new Set(
          rawSessions.map((s: { lesson_id: string | null }) => s.lesson_id).filter(Boolean),
        ),
      ] as string[]

      const [lessonRes, masteryRes] = await Promise.all([
        lessonIds.length > 0
          ? supabase.from('lessons').select('id, title').in('id', lessonIds)
          : Promise.resolve({ data: [] }),
        lessonIds.length > 0
          ? supabase
              .from('lesson_progress')
              .select('lesson_id, mastery_status, score')
              .eq('user_id', studentId)
              .in('lesson_id', lessonIds)
          : Promise.resolve({ data: [] }),
      ])

      if (cancelled) return

      const lessonMap = new Map(
        ((lessonRes.data as { id: string; title: string }[]) ?? []).map((l) => [l.id, l.title]),
      )
      const masteryMap = new Map(
        (
          (masteryRes.data as {
            lesson_id: string
            mastery_status: string
            score: number
          }[]) ?? []
        ).map((m) => [m.lesson_id, m]),
      )

      const enriched: SessionEntry[] = rawSessions.map(
        (s: {
          id: string
          current_state: string
          status: string
          session_mode: string | null
          started_at: string
          updated_at: string
          lesson_id: string | null
        }) => {
          const mastery = s.lesson_id ? masteryMap.get(s.lesson_id) : null
          const fiveRPhase =
            s.current_state && s.current_state in STATE_METADATA
              ? STATE_METADATA[s.current_state as CognitiveState].fiveRMapping
              : null
          return {
            ...s,
            lesson_title: s.lesson_id ? (lessonMap.get(s.lesson_id) ?? null) : null,
            mastery_score: mastery?.score ?? null,
            mastery_status: mastery?.mastery_status ?? null,
            fiveRPhase,
          }
        },
      )

      setSessions(enriched)
      setLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [studentId])

  const tabs: { id: Tab; label: string }[] = [
    { id: 'timeline', label: '5Rs Timeline' },
    { id: 'trace', label: 'TRACE Profile' },
    { id: 'standards', label: 'CCSS Standards' },
  ]

  return (
    <main id="main-content" className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      {/* Back nav */}
      <button
        type="button"
        onClick={() => navigate('/educator')}
        className="text-sm text-brand-600 hover:underline focus:outline-none focus:ring-2 focus:ring-brand-500"
        aria-label="Back to educator dashboard"
      >
        ← Educator Dashboard
      </button>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{studentName}</h1>
        <p className="mt-0.5 text-sm text-slate-500">Learning progress and session history</p>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 rounded-xl bg-slate-100 p-1"
        role="tablist"
        aria-label="Student detail tabs"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <>
          {/* 5Rs Timeline */}
          <div
            id="panel-timeline"
            role="tabpanel"
            aria-labelledby="tab-timeline"
            hidden={activeTab !== 'timeline'}
          >
            {sessions.length === 0 ? (
              <p className="text-sm text-slate-500">No sessions recorded yet.</p>
            ) : (
              <ol className="space-y-3">
                {sessions.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <div className="shrink-0 pt-0.5">
                      {s.fiveRPhase && (
                        <span
                          className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${FIVE_R_COLORS[s.fiveRPhase] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}
                        >
                          {s.fiveRPhase}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <p className="truncate text-sm font-medium text-slate-800">
                          {s.lesson_title ?? 'Lesson'}
                        </p>
                        {s.mastery_status && (
                          <span
                            className={`text-xs font-medium ${MASTERY_COLORS[s.mastery_status] ?? ''}`}
                          >
                            {s.mastery_status.replace('_', ' ')}
                          </span>
                        )}
                        {typeof s.mastery_score === 'number' && (
                          <span className="text-xs text-slate-400">
                            {Math.round(s.mastery_score * 100)}%
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {formatDate(s.started_at)} ·{' '}
                        {s.status === 'active' ? (
                          <span className="font-medium text-green-600">In progress</span>
                        ) : (
                          s.current_state
                        )}
                        {s.session_mode && s.session_mode !== 'standard' && (
                          <> · {s.session_mode.replace('_', ' ')}</>
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* TRACE Profile */}
          <div
            id="panel-trace"
            role="tabpanel"
            aria-labelledby="tab-trace"
            hidden={activeTab !== 'trace'}
          >
            {!traceAverages ? (
              <p className="text-sm text-slate-500">
                No TRACE data yet — complete a learning session to build a fluency profile.
              </p>
            ) : (
              <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">TRACE Fluency Profile</h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Averaged across all completed sessions
                  </p>
                </div>
                <div className="space-y-4">
                  {(Object.entries(TRACE_LABELS) as [keyof TraceAverages, string][]).map(
                    ([dim, label]) => {
                      const score = traceAverages[dim]
                      if (typeof score !== 'number') return null
                      return <TraceBar key={dim} label={label} score={score} />
                    },
                  )}
                </div>
              </div>
            )}
          </div>

          {/* CCSS Standards */}
          <div
            id="panel-standards"
            role="tabpanel"
            aria-labelledby="tab-standards"
            hidden={activeTab !== 'standards'}
          >
            {studentId && <EducatorStandardsView studentId={studentId} studentName={studentName} />}
          </div>
        </>
      )}
    </main>
  )
}
