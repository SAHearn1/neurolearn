import { Card } from '../ui/Card'
import { ProgressBar } from '../ui/ProgressBar'
import type { TraceFluency, RegulationState } from '../../lib/raca/types/epistemic'
import type { AdaptationLevel } from '../../lib/raca/layer4-epistemic/adaptation-engine'

interface Props {
  trace: TraceFluency
  regulation: RegulationState
  adaptationLevel: AdaptationLevel
}

const TRACE_LABELS: Record<keyof Omit<TraceFluency, 'overall'>, string> = {
  think: 'Think',
  reason: 'Reason',
  articulate: 'Articulate',
  check: 'Check',
  extend: 'Extend',
}

const ADAPTATION_LABELS: Record<AdaptationLevel, { label: string; color: string }> = {
  standard: { label: 'Standard', color: 'text-green-700 bg-green-100' },
  guided: { label: 'Guided', color: 'text-blue-700 bg-blue-100' },
  supported: { label: 'Supported', color: 'text-amber-700 bg-amber-100' },
  scaffolded: { label: 'Scaffolded', color: 'text-red-700 bg-red-100' },
}

export function EpistemicDashboard({ trace, regulation, adaptationLevel }: Props) {
  const adapt = ADAPTATION_LABELS[adaptationLevel]

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Cognitive Dashboard</h3>
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${adapt.color}`}>
            {adapt.label}
          </span>
        </div>

        <div>
          <div className="mb-1 flex justify-between text-xs text-slate-500">
            <span>Regulation</span>
            <span>{regulation.level}/100</span>
          </div>
          <ProgressBar value={regulation.level} />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-600">TRACE Fluency</p>
          {(Object.keys(TRACE_LABELS) as Array<keyof typeof TRACE_LABELS>).map((key) => (
            <div key={key}>
              <div className="mb-0.5 flex justify-between text-xs text-slate-500">
                <span>{TRACE_LABELS[key]}</span>
                <span>{trace[key]}/10</span>
              </div>
              <ProgressBar value={trace[key] * 10} />
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 pt-2">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-600">Overall TRACE</span>
            <span className="font-bold text-brand-700">{trace.overall}/10</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
