/**
 * ArtifactEvidenceDrawer — educator view of a learner's session artifacts,
 * Amara's eliciting questions, and TRACE/mastery evidence.
 * Issue #338 (artifact viewer) + #339 (Amara's questions in drawer).
 */

import { useEffect, useState } from 'react'
import { supabase } from '../../../utils/supabase/client'
import { Spinner } from '../ui/Spinner'

interface Props {
  isOpen: boolean
  studentId: string
  sessionId: string
  studentName: string
  onClose: () => void
}

interface ArtifactRow {
  id: string
  kind: string
  state: string
  content: string
  word_count: number | null
  version: number | null
  created_at: string
}

interface InteractionRow {
  id: string
  agent_id: string
  state: string
  prompt: string
  response: string | null
  blocked: boolean
  created_at: string
}

interface SessionMeta {
  lesson_id: string | null
  lesson_title: string | null
  mastery_status: string | null
  mastery_score: number | null
  created_at: string | null
}

const KIND_LABELS: Record<string, string> = {
  reflection: 'Reflection',
  position_frame: 'Position Frame',
  plan_outline: 'Plan Outline',
  draft: 'Draft',
  revision: 'Revision',
  defense_response: 'Defense Response',
  reconnection_reflection: 'Reconnection Reflection',
}

const MASTERY_COLORS: Record<string, string> = {
  proficient: 'text-green-700 bg-green-50 border-green-200',
  in_progress: 'text-amber-700 bg-amber-50 border-amber-200',
  developing: 'text-orange-700 bg-orange-50 border-orange-200',
  not_started: 'text-slate-600 bg-slate-50 border-slate-200',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function ArtifactEvidenceDrawer({
  isOpen,
  studentId,
  sessionId,
  studentName,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [artifacts, setArtifacts] = useState<ArtifactRow[]>([])
  const [interactions, setInteractions] = useState<InteractionRow[]>([])
  const [meta, setMeta] = useState<SessionMeta | null>(null)
  const [expandedArtifact, setExpandedArtifact] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !sessionId || !studentId) return
    let cancelled = false

    const load = async () => {
      if (cancelled) return
      setLoading(true)
      setArtifacts([])
      setInteractions([])
      setMeta(null)
      // Fetch session metadata + lesson title
      const { data: sessionRow } = await supabase
        .from('cognitive_sessions')
        .select('lesson_id, created_at')
        .eq('id', sessionId)
        .eq('user_id', studentId)
        .maybeSingle()

      if (cancelled) return

      let lessonTitle: string | null = null
      let masteryStatus: string | null = null
      let masteryScore: number | null = null

      if (sessionRow?.lesson_id) {
        const [lessonRes, masteryRes] = await Promise.all([
          supabase.from('lessons').select('title').eq('id', sessionRow.lesson_id).maybeSingle(),
          supabase
            .from('adaptive_learning_state')
            .select('mastery_status, mastery_score_float')
            .eq('user_id', studentId)
            .eq('lesson_id', sessionRow.lesson_id)
            .maybeSingle(),
        ])
        if (!cancelled) {
          lessonTitle = lessonRes.data?.title ?? null
          masteryStatus = masteryRes.data?.mastery_status ?? null
          masteryScore = masteryRes.data?.mastery_score_float ?? null
        }
      }

      if (cancelled) return

      setMeta({
        lesson_id: sessionRow?.lesson_id ?? null,
        lesson_title: lessonTitle,
        mastery_status: masteryStatus,
        mastery_score: masteryScore,
        created_at: sessionRow?.created_at ?? null,
      })

      // Fetch artifacts + interactions in parallel
      const [artifactsRes, interactionsRes] = await Promise.all([
        supabase
          .from('raca_artifacts')
          .select('id, kind, state, content, word_count, version, created_at')
          .eq('session_id', sessionId)
          .eq('user_id', studentId)
          .order('created_at', { ascending: true }),
        supabase
          .from('raca_agent_interactions')
          .select('id, agent_id, state, prompt, response, blocked, created_at')
          .eq('session_id', sessionId)
          .eq('blocked', false)
          .order('created_at', { ascending: true }),
      ])

      if (cancelled) return

      setArtifacts((artifactsRes.data as ArtifactRow[] | null) ?? [])
      setInteractions((interactionsRes.data as InteractionRow[] | null) ?? [])
      setLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [isOpen, sessionId, studentId])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={`Session evidence for ${studentName}`}
    >
      {/* Overlay */}
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close drawer"
        tabIndex={-1}
      />

      {/* Drawer panel */}
      <div className="relative z-10 flex h-full w-full max-w-xl flex-col overflow-hidden bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Session Evidence</h2>
            <p className="text-sm text-slate-500">{studentName}</p>
            {meta?.lesson_title && (
              <p className="mt-0.5 text-xs font-medium text-brand-700">{meta.lesson_title}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Session metadata */}
              {meta && (
                <div className="flex flex-wrap items-center gap-3">
                  {meta.created_at && (
                    <span className="text-xs text-slate-500">{formatDate(meta.created_at)}</span>
                  )}
                  {meta.mastery_status && (
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${MASTERY_COLORS[meta.mastery_status] ?? MASTERY_COLORS.not_started}`}
                    >
                      {meta.mastery_status.replace('_', ' ')}
                    </span>
                  )}
                  {typeof meta.mastery_score === 'number' && (
                    <span className="text-xs text-slate-500">
                      Score: {Math.round(meta.mastery_score * 100)}%
                    </span>
                  )}
                </div>
              )}

              {/* Artifacts */}
              {artifacts.length === 0 ? (
                <p className="text-sm text-slate-500">No artifacts recorded for this session.</p>
              ) : (
                artifacts.map((artifact) => {
                  // Find Amara's questions for this artifact's state
                  const stateInteractions = interactions.filter(
                    (i) => i.state === artifact.state && i.response,
                  )
                  const isExpanded = expandedArtifact === artifact.id

                  return (
                    <div
                      key={artifact.id}
                      className="rounded-xl border border-slate-200 bg-white shadow-sm"
                    >
                      {/* Artifact header */}
                      <button
                        type="button"
                        className="flex w-full items-center justify-between px-4 py-3 text-left"
                        onClick={() => setExpandedArtifact(isExpanded ? null : artifact.id)}
                        aria-expanded={isExpanded}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900">
                            {KIND_LABELS[artifact.kind] ?? artifact.kind}
                          </span>
                          {artifact.version && artifact.version > 1 && (
                            <span className="rounded-full bg-brand-100 px-1.5 py-0.5 text-xs text-brand-700">
                              v{artifact.version}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {artifact.word_count !== null && (
                            <span className="text-xs text-slate-400">{artifact.word_count}w</span>
                          )}
                          <span className="text-xs text-slate-400" aria-hidden="true">
                            {isExpanded ? '▲' : '▼'}
                          </span>
                        </div>
                      </button>

                      {/* Artifact content */}
                      {isExpanded && (
                        <div className="space-y-4 border-t border-slate-100 px-4 pb-4 pt-3">
                          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                            {artifact.content}
                          </p>

                          {/* Amara's questions for this state (#339) */}
                          {stateInteractions.length > 0 && (
                            <div className="rounded-lg bg-brand-50 p-3">
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-700">
                                Amara's Questions — {artifact.state}
                              </p>
                              <div className="space-y-3">
                                {stateInteractions.map((interaction) => (
                                  <div key={interaction.id} className="space-y-1">
                                    <p className="text-xs text-slate-500 italic">
                                      Learner: "{interaction.prompt.slice(0, 120)}
                                      {interaction.prompt.length > 120 ? '…' : ''}"
                                    </p>
                                    <p className="text-xs leading-relaxed text-brand-800">
                                      {interaction.response?.slice(0, 300)}
                                      {(interaction.response?.length ?? 0) > 300 ? '…' : ''}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
