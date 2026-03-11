// UX-08 / Issue #324: Pre-session summary for returning learners
// Shown between the lesson landing and SessionModeSelector when the
// learner has at least one prior session on this lesson.

import type { AgentSessionPersonalization } from '../../hooks/useAgent'

interface Props {
  lessonTitle: string
  priorOutcome: NonNullable<AgentSessionPersonalization['priorSessionOutcome']>
  masteryScore: number | null // 0.0–1.0
  traceProfile: Record<string, number> | undefined
  onContinue: () => void
}

const OUTCOME_META: Record<
  NonNullable<AgentSessionPersonalization['priorSessionOutcome']>,
  { label: string; color: string; suggestion: string }
> = {
  proficient: {
    label: 'Proficient',
    color: 'bg-green-100 text-green-800 border-green-200',
    suggestion: 'Ready to challenge yourself? Try Challenge mode to deepen mastery.',
  },
  in_progress: {
    label: 'In progress',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    suggestion: "You're making great progress. Standard mode picks up right where you left off.",
  },
  developing: {
    label: 'Developing',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    suggestion: "Let's reinforce the foundations. Review mode offers extra scaffolding.",
  },
  not_started: {
    label: 'Not started',
    color: 'bg-slate-100 text-slate-600 border-slate-200',
    suggestion: 'This is your first time here. Standard mode is a great place to begin.',
  },
}

const TRACE_LABELS: Record<string, string> = {
  think: 'Think',
  reason: 'Reason',
  articulate: 'Articulate',
  check: 'Check',
  extend: 'Extend',
  ethical: 'Ethical',
}

function weakestTraceDimension(
  profile: Record<string, number>,
): { dim: string; label: string; score: number } | null {
  let weakest: { dim: string; label: string; score: number } | null = null
  for (const [dim, score] of Object.entries(profile)) {
    if (TRACE_LABELS[dim] && (weakest === null || score < weakest.score)) {
      weakest = { dim, label: TRACE_LABELS[dim], score }
    }
  }
  return weakest
}

export function PriorSessionSummary({
  lessonTitle,
  priorOutcome,
  masteryScore,
  traceProfile,
  onContinue,
}: Props) {
  const meta = OUTCOME_META[priorOutcome] ?? OUTCOME_META.in_progress
  const mastery = masteryScore !== null ? Math.round(masteryScore * 100) : null
  const weak = traceProfile ? weakestTraceDimension(traceProfile) : null

  return (
    <div
      className="mx-auto w-full max-w-lg space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      aria-labelledby="prior-summary-heading"
    >
      {/* Heading */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
          Welcome back
        </p>
        <h2 id="prior-summary-heading" className="mt-0.5 text-lg font-bold text-slate-900">
          {lessonTitle}
        </h2>
      </div>

      {/* Mastery status */}
      <div className="flex items-center gap-3">
        <span
          className={`inline-block rounded-full border px-3 py-0.5 text-sm font-semibold ${meta.color}`}
        >
          {meta.label}
        </span>
        {mastery !== null && <span className="text-sm text-slate-500">{mastery}% mastery</span>}
      </div>

      {/* Mastery progress bar */}
      {mastery !== null && (
        <div>
          <div
            className="h-2.5 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-label={`Mastery: ${mastery}%`}
            aria-valuenow={mastery}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                mastery >= 70 ? 'bg-green-500' : mastery >= 40 ? 'bg-amber-400' : 'bg-orange-400'
              }`}
              style={{ width: `${mastery}%` }}
            />
          </div>
        </div>
      )}

      {/* TRACE focus area */}
      {weak && weak.score < 8 && (
        <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3">
          <p className="text-xs font-semibold text-brand-700">Focus area this session</p>
          <p className="mt-0.5 text-sm text-brand-900">
            <span className="font-semibold">{weak.label}</span> — currently {weak.score.toFixed(1)}
            /10. Amara will prioritise questions that develop this dimension.
          </p>
        </div>
      )}

      {/* Mode suggestion */}
      <p className="text-sm text-slate-600">{meta.suggestion}</p>

      {/* CTA */}
      <button
        type="button"
        onClick={onContinue}
        className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
      >
        Choose session mode →
      </button>
    </div>
  )
}
