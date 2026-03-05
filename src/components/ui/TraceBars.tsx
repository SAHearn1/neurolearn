import type { TraceFluency } from '../../lib/raca/types/epistemic'

const TRACE_DIMS: Array<{ key: keyof Omit<TraceFluency, 'overall'>; label: string; desc: string }> =
  [
    { key: 'think', label: 'Think', desc: 'Pause quality before responding' },
    { key: 'reason', label: 'Reason', desc: 'Explicit reasoning moves' },
    { key: 'articulate', label: 'Articulate', desc: 'Clarity of expression' },
    { key: 'check', label: 'Check', desc: 'Self-correction depth' },
    { key: 'extend', label: 'Extend', desc: 'Connecting to broader ideas' },
    { key: 'ethical', label: 'Ethical', desc: 'Ethical reasoning markers' },
  ]

function Bar({ label, desc, score }: { label: string; desc: string; score: number }) {
  const pct = Math.round((score / 10) * 100)
  const barColor = score >= 7 ? 'bg-emerald-500' : score >= 4 ? 'bg-amber-400' : 'bg-slate-300'
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-700">{label}</span>
          <span className="ml-2 text-xs text-slate-400">{desc}</span>
        </div>
        <span className="text-xs font-bold text-slate-600">{score}/10</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

interface TraceBarsProps {
  traceAverages: Partial<TraceFluency>
}

/** Renders all 6 TRACE dimension bars. Used in educator, parent, and profile views. */
export function TraceBars({ traceAverages }: TraceBarsProps) {
  return (
    <div className="space-y-3">
      {TRACE_DIMS.map(({ key, label, desc }) => (
        <Bar key={key} label={label} desc={desc} score={traceAverages[key] ?? 0} />
      ))}
    </div>
  )
}
