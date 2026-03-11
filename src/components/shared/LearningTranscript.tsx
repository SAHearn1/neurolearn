// DATA-01: Learning Transcript component
// Designed for both screen and print display

import type { LearningTranscript } from '../../hooks/useLearningTranscript'

interface Props {
  transcript: LearningTranscript
  showActions?: boolean
}

const TRACE_LABELS: Record<string, string> = {
  think: 'Think',
  reason: 'Reason',
  articulate: 'Articulate',
  check: 'Check',
  extend: 'Extend',
  ethical: 'Ethical',
}

const MASTERY_COLORS: Record<string, string> = {
  emerging: 'bg-yellow-100 text-yellow-800',
  developing: 'bg-orange-100 text-orange-800',
  proficient: 'bg-green-100 text-green-800',
  advanced: 'bg-blue-100 text-blue-800',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function TraceBar({ label, score }: { label: string; score: number }) {
  const pct = Math.round((score / 10) * 100)
  const barColor = score >= 7 ? 'bg-green-500' : score >= 4 ? 'bg-amber-400' : 'bg-slate-300'
  return (
    <li className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-xs font-medium text-slate-600">{label}</span>
      <div
        className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-label={`${label}: ${score} out of 10`}
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={10}
      >
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 shrink-0 text-right text-xs font-semibold text-slate-700">
        {score.toFixed(1)}
      </span>
    </li>
  )
}

export function LearningTranscript({ transcript, showActions = false }: Props) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Section 1: Header */}
      <section aria-labelledby="transcript-header">
        <h1 id="transcript-header" className="text-xl font-bold text-slate-900 print:text-2xl">
          {transcript.studentName}
        </h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Learning Transcript — Generated {formatDate(transcript.generatedAt)}
        </p>
      </section>

      {/* Section 2: Learning Summary */}
      <section aria-labelledby="learning-summary-heading">
        <h2
          id="learning-summary-heading"
          className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500"
        >
          Learning Summary
        </h2>
        <dl className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
            <dt className="text-xs text-slate-500">Lessons</dt>
            <dd className="mt-0.5 text-xl font-bold text-slate-900">
              {transcript.lessonsCompleted}
            </dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
            <dt className="text-xs text-slate-500">Streak Days</dt>
            <dd className="mt-0.5 text-xl font-bold text-slate-900">
              {transcript.totalStreakDays}
            </dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
            <dt className="text-xs text-slate-500">Courses</dt>
            <dd className="mt-0.5 text-xl font-bold text-slate-900">
              {transcript.coursesEnrolled}
            </dd>
          </div>
        </dl>
      </section>

      {/* Section 3: Thinking Profile */}
      {transcript.traceAverages && (
        <section aria-labelledby="thinking-profile-heading">
          <h2
            id="thinking-profile-heading"
            className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500"
          >
            Thinking Profile
          </h2>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <ul className="space-y-2" aria-label="TRACE dimension scores">
              {Object.entries(TRACE_LABELS).map(([key, label]) => {
                const score = transcript.traceAverages![key] ?? 0
                return <TraceBar key={key} label={label} score={score} />
              })}
            </ul>
          </div>
        </section>
      )}

      {/* Section 4: Standards Progress */}
      {transcript.ccssEvidence.length > 0 && (
        <section aria-labelledby="standards-heading">
          <h2
            id="standards-heading"
            className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500"
          >
            Standards Progress
          </h2>
          <ul className="space-y-2" aria-label="CCSS standards with mastery levels">
            {transcript.ccssEvidence.map((ev) => (
              <li
                key={ev.standardCode}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <p className="truncate text-xs font-medium text-slate-700">{ev.standardCode}</p>
                  <p className="truncate text-xs text-slate-400">
                    {ev.domain} · Grade {ev.grade}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${MASTERY_COLORS[ev.masteryLevel]}`}
                >
                  {ev.masteryLevel}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Section 5: Skill Power-Ups */}
      <section aria-labelledby="powerups-heading">
        <h2
          id="powerups-heading"
          className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500"
        >
          Skill Power-Ups
        </h2>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-700">
            <span className="text-xl font-bold text-brand-600">{transcript.powerUpCount}</span>{' '}
            unique skill{transcript.powerUpCount === 1 ? '' : 's'} demonstrated across sessions
          </p>
        </div>
      </section>

      {/* Section 6: Recent Goals */}
      {transcript.recentGoals.length > 0 && (
        <section aria-labelledby="goals-heading">
          <h2
            id="goals-heading"
            className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500"
          >
            Recent Goals
          </h2>
          <ul className="space-y-1.5" aria-label="Student learning goals">
            {transcript.recentGoals.map((goal, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span
                  className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500"
                  aria-hidden="true"
                />
                {goal}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Actions — hidden in print */}
      {showActions && (
        <div className="flex justify-end print:hidden">
          <button
            onClick={handlePrint}
            aria-label="Print learning transcript"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            Print
          </button>
        </div>
      )}
    </div>
  )
}
