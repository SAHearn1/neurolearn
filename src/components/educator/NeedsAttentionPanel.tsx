// EDU-13: Needs Attention Panel
// Surfaces students with low regulation levels or declining regulation trend

import { useNavigate } from 'react-router-dom'
import type { StudentRegulationSummary } from '../../hooks/useStudentRegulation'
import { FrustrationIndicator } from './FrustrationIndicator'

interface Props {
  summaries: Record<string, StudentRegulationSummary>
  studentNames: Record<string, string>
}

export function NeedsAttentionPanel({ summaries, studentNames }: Props) {
  const navigate = useNavigate()
  const needsAttention = Object.values(summaries).filter(
    (s) => s.averageRegulationLevel < 40 || s.trend === 'declining',
  )

  if (needsAttention.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm text-slate-600">All students appear to be doing well.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
      <h3 className="mb-4 text-sm font-semibold text-amber-900">
        Needs Attention ({needsAttention.length})
      </h3>
      <ul className="space-y-3" aria-label="Students needing additional support">
        {needsAttention.map((summary) => {
          const name = studentNames[summary.userId] ?? 'Student'
          return (
            <li key={summary.userId} className="flex items-center justify-between gap-4">
              <FrustrationIndicator summary={summary} studentName={name} />
              <button
                type="button"
                onClick={() => navigate(`/educator/students/${summary.userId}`)}
                className="shrink-0 text-xs font-medium text-amber-700 underline hover:text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
                aria-label={`View session details for ${name}`}
              >
                View session
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
