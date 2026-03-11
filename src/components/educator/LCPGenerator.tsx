// EDU-15: LCP Generator component
// Form to review and export Learner Cognitive Profile

import { useLcpGenerator } from '../../hooks/useLcpGenerator'
import { Spinner } from '../ui/Spinner'

interface Props {
  studentId: string
  studentName: string
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
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function LCPGenerator({ studentId, studentName }: Props) {
  const { lcpData, loading, educatorNotes, setEducatorNotes } = useLcpGenerator(studentId)

  if (loading) return <Spinner />

  if (!lcpData) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
        <p className="text-sm text-slate-500">No data available for this student.</p>
      </div>
    )
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Print-only header */}
      <div className="print:block hidden">
        <h1 className="text-xl font-bold text-slate-900">
          Learner Cognitive Profile — {studentName}
        </h1>
        <p className="text-sm text-slate-500">Generated: {formatDate(lcpData.generatedAt)}</p>
      </div>

      {/* Section 1: Cognitive Profile Summary */}
      <section
        aria-labelledby="lcp-profile-heading"
        className="rounded-xl border border-slate-200 bg-white p-5"
      >
        <h2 id="lcp-profile-heading" className="mb-4 text-base font-semibold text-slate-900">
          Cognitive Profile Summary
        </h2>

        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-slate-500">Mastery Score</dt>
            <dd className="mt-0.5 text-lg font-bold text-slate-900">
              {Math.round(lcpData.masteryScore * 100)}%
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Lessons Completed</dt>
            <dd className="mt-0.5 text-lg font-bold text-slate-900">{lcpData.lessonsCompleted}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Streak Days</dt>
            <dd className="mt-0.5 text-lg font-bold text-slate-900">{lcpData.streakDays}</dd>
          </div>
          <div className="col-span-2 sm:col-span-3">
            <dt className="text-xs text-slate-500">Regulation Trend</dt>
            <dd className="mt-0.5 text-sm font-medium text-slate-700">{lcpData.regulationTrend}</dd>
          </div>
        </dl>

        {/* TRACE dimension bars */}
        {lcpData.traceAverages && (
          <div className="mt-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              TRACE Fluency Dimensions
            </h3>
            <ul className="space-y-2" aria-label="TRACE dimension scores">
              {Object.entries(TRACE_LABELS).map(([key, label]) => {
                const score = lcpData.traceAverages![key] ?? 0
                const pct = Math.round((score / 10) * 100)
                return (
                  <li key={key} className="flex items-center gap-3">
                    <span className="w-20 shrink-0 text-xs font-medium text-slate-600">
                      {label}
                    </span>
                    <div
                      className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"
                      role="progressbar"
                      aria-label={`${label}: ${score} out of 10`}
                      aria-valuenow={score}
                      aria-valuemin={0}
                      aria-valuemax={10}
                    >
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 shrink-0 text-right text-xs font-semibold text-slate-700">
                      {typeof score === 'number' ? score.toFixed(1) : '—'}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </section>

      {/* Section 2: Educator Notes & Goals */}
      <section
        aria-labelledby="lcp-notes-heading"
        className="rounded-xl border border-slate-200 bg-white p-5"
      >
        <h2 id="lcp-notes-heading" className="mb-4 text-base font-semibold text-slate-900">
          Educator Notes &amp; Goals
        </h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="educator-notes" className="block text-xs font-medium text-slate-600">
              Educator Narrative Notes
            </label>
            <textarea
              id="educator-notes"
              value={educatorNotes}
              onChange={(e) => setEducatorNotes(e.target.value)}
              placeholder="Add observations, context, or recommendations for this student's learning profile…"
              minLength={0}
              maxLength={500}
              rows={4}
              aria-describedby="notes-char-count"
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            <p id="notes-char-count" className="mt-1 text-right text-xs text-slate-400">
              {educatorNotes.length}/500
            </p>
          </div>

          {lcpData.goalsText.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-slate-600">Student Goals</p>
              <ul className="space-y-1" aria-label="Student learning goals">
                {lcpData.goalsText.map((goal, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span
                      className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500"
                      aria-hidden="true"
                    />
                    {goal}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Actions — hidden in print */}
      <div className="flex justify-end print:hidden">
        <button
          onClick={handlePrint}
          aria-label="Generate and print LCP PDF"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400"
        >
          Generate PDF
        </button>
      </div>
    </div>
  )
}
