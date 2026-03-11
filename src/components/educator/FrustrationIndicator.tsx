// EDU-13: Frustration Indicator component
// Compact regulation status for a single student

import type { StudentRegulationSummary } from '../../hooks/useStudentRegulation'

interface Props {
  summary: StudentRegulationSummary
  studentName: string
}

const TREND_ARROWS: Record<StudentRegulationSummary['trend'], string> = {
  improving: '↑',
  stable: '→',
  declining: '↓',
  unknown: '–',
}

const TREND_LABELS: Record<StudentRegulationSummary['trend'], string> = {
  improving: 'Improving',
  stable: 'Stable',
  declining: 'Declining',
  unknown: 'Unknown',
}

function dotColor(avg: number): string {
  if (avg >= 70) return 'bg-green-500'
  if (avg >= 40) return 'bg-yellow-400'
  return 'bg-red-500'
}

function trendColor(trend: StudentRegulationSummary['trend']): string {
  if (trend === 'improving') return 'text-green-600'
  if (trend === 'declining') return 'text-red-600'
  return 'text-slate-500'
}

export function FrustrationIndicator({ summary, studentName }: Props) {
  const ariaLabel = `${studentName}: average regulation ${summary.averageRegulationLevel}%, trend ${TREND_LABELS[summary.trend]}`

  return (
    <div className="flex items-center gap-3" aria-label={ariaLabel} role="group">
      {/* Status dot */}
      <span
        className={`h-3 w-3 shrink-0 rounded-full ${dotColor(summary.averageRegulationLevel)}`}
        aria-hidden="true"
      />

      {/* Student name + stats */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">{studentName}</p>
        <p className="text-xs text-slate-500">Avg regulation: {summary.averageRegulationLevel}%</p>
      </div>

      {/* Trend arrow */}
      <span
        className={`text-lg font-bold ${trendColor(summary.trend)}`}
        aria-label={`Trend: ${TREND_LABELS[summary.trend]}`}
      >
        {TREND_ARROWS[summary.trend]}
      </span>
    </div>
  )
}
