// src/components/raca/SessionSummaryCard.tsx
// AGY-03: Agent Orchestration Bus — Session summary shown at ARCHIVE state

import type { TraceScores } from '../../hooks/useTraceScoring'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  completedStates: string[]
  sessionDurationMs: number
  artifactWordCount: number
  traceScores?: TraceScores
}

// ---------------------------------------------------------------------------
// TRACE dimension labels
// ---------------------------------------------------------------------------

const TRACE_LABELS: Record<keyof TraceScores, string> = {
  think: 'Think',
  reason: 'Reason',
  articulate: 'Articulate',
  check: 'Check',
  extend: 'Extend',
  ethical: 'Ethical',
}

const TOTAL_STATES = 9

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes} min ${seconds} sec`
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface ScoreBarProps {
  dimension: keyof TraceScores
  score: number
}

function ScoreBar({ dimension, score }: ScoreBarProps) {
  const label = TRACE_LABELS[dimension]
  const percentage = Math.round((score / 10) * 100)

  return (
    <li className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-xs font-medium text-slate-600">{label}</span>
      <div
        className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-label={`${label} score: ${score} out of 10`}
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={10}
      >
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-xs font-semibold text-slate-700">
        {score.toFixed(1)}
      </span>
    </li>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SessionSummaryCard({
  completedStates,
  sessionDurationMs,
  artifactWordCount,
  traceScores,
}: Props) {
  const statesCompleted = completedStates.length

  return (
    <article
      aria-labelledby="session-summary-heading"
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md"
    >
      <h2 id="session-summary-heading" className="mb-4 text-xl font-bold text-slate-800">
        Session complete! 🎉
      </h2>

      <dl className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-slate-50 px-4 py-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Duration</dt>
          <dd className="mt-1 text-lg font-semibold text-slate-800">
            {formatDuration(sessionDurationMs)}
          </dd>
        </div>

        <div className="rounded-lg bg-slate-50 px-4 py-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            States completed
          </dt>
          <dd className="mt-1 text-lg font-semibold text-slate-800">
            {statesCompleted} / {TOTAL_STATES}
          </dd>
        </div>

        <div className="rounded-lg bg-slate-50 px-4 py-3">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Words written
          </dt>
          <dd className="mt-1 text-lg font-semibold text-slate-800">
            {artifactWordCount.toLocaleString()}
          </dd>
        </div>
      </dl>

      {traceScores && (
        <section aria-labelledby="trace-scores-heading" className="mt-2">
          <h3
            id="trace-scores-heading"
            className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500"
          >
            TRACE Fluency
          </h3>
          <ul className="space-y-2" aria-label="TRACE dimension scores">
            {(Object.keys(TRACE_LABELS) as Array<keyof TraceScores>).map((dimension) => (
              <ScoreBar key={dimension} dimension={dimension} score={traceScores[dimension]} />
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
