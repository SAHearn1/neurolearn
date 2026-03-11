import { useSettingsStore } from '../../store/settingsStore'
import type { TraceFluency } from '../../lib/raca/types/epistemic'
import { TraceBars } from './TraceBars'

export interface TraceScores {
  think: number
  reason: number
  articulate: number
  check: number
  extend: number
  ethical: number
}

const DIMS: { key: keyof TraceScores; label: string; tooltip: string }[] = [
  { key: 'think', label: 'Think', tooltip: 'How deeply you explore ideas' },
  { key: 'reason', label: 'Reason', tooltip: 'How well you build arguments' },
  { key: 'articulate', label: 'Articulate', tooltip: 'How clearly you express yourself' },
  { key: 'check', label: 'Check', tooltip: 'How often you question your own thinking' },
  { key: 'extend', label: 'Extend', tooltip: 'How far you connect ideas to new contexts' },
  { key: 'ethical', label: 'Ethical', tooltip: 'How thoughtfully you consider impact' },
]

const MAX = 10
const SIZE = 200
const CENTER = SIZE / 2
const RADIUS = 80

function polarToXY(angle: number, r: number): { x: number; y: number } {
  const rad = (angle - 90) * (Math.PI / 180)
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) }
}

function buildPolygon(scores: TraceScores): string {
  return DIMS.map(({ key }, i) => {
    const angle = (360 / DIMS.length) * i
    const r = (scores[key] / MAX) * RADIUS
    const { x, y } = polarToXY(angle, r)
    return `${x},${y}`
  }).join(' ')
}

function buildGrid(fraction: number): string {
  return DIMS.map((_, i) => {
    const angle = (360 / DIMS.length) * i
    const { x, y } = polarToXY(angle, RADIUS * fraction)
    return `${x},${y}`
  }).join(' ')
}

interface TraceRadarProps {
  scores: TraceScores
  className?: string
}

export function TraceRadar({ scores, className = '' }: TraceRadarProps) {
  const reduceMotion = useSettingsStore((s) => s.accessibility.reduce_motion)

  if (reduceMotion) {
    // TraceBars accepts { traceAverages: Partial<TraceFluency> }
    const traceAverages: Partial<TraceFluency> = {
      think: scores.think,
      reason: scores.reason,
      articulate: scores.articulate,
      check: scores.check,
      extend: scores.extend,
      ethical: scores.ethical,
    }
    return <TraceBars traceAverages={traceAverages} />
  }

  const overall =
    Math.round((DIMS.reduce((sum, { key }) => sum + scores[key], 0) / DIMS.length) * 10) / 10

  const axisLabel = DIMS.map(({ key, label, tooltip }, i) => {
    const angle = (360 / DIMS.length) * i
    const { x, y } = polarToXY(angle, RADIUS + 20)
    return { x, y, label, tooltip, score: scores[key] }
  })

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        height={SIZE}
        role="img"
        aria-label={`TRACE thinking profile. Overall score: ${overall} out of 10. ${DIMS.map(({ key, label }) => `${label}: ${scores[key]}`).join(', ')}.`}
      >
        {/* Grid rings at 25%, 50%, 75%, 100% */}
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <polygon key={f} points={buildGrid(f)} fill="none" stroke="#e2e8f0" strokeWidth={1} />
        ))}

        {/* Axis spokes */}
        {DIMS.map(({ key: _key }, i) => {
          const angle = (360 / DIMS.length) * i
          const { x, y } = polarToXY(angle, RADIUS)
          return (
            <line key={i} x1={CENTER} y1={CENTER} x2={x} y2={y} stroke="#e2e8f0" strokeWidth={1} />
          )
        })}

        {/* Score polygon */}
        <polygon
          points={buildPolygon(scores)}
          fill="rgb(99 102 241 / 0.2)"
          stroke="rgb(99 102 241)"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Score dots */}
        {DIMS.map(({ key }, i) => {
          const angle = (360 / DIMS.length) * i
          const r = (scores[key] / MAX) * RADIUS
          const { x, y } = polarToXY(angle, r)
          return <circle key={i} cx={x} cy={y} r={3} fill="rgb(99 102 241)" />
        })}

        {/* Axis labels */}
        {axisLabel.map(({ x, y, label, score }) => {
          const textAnchor = x < CENTER - 5 ? 'end' : x > CENTER + 5 ? 'start' : 'middle'
          return (
            <text
              key={label}
              x={x}
              y={y}
              textAnchor={textAnchor}
              dominantBaseline="middle"
              fontSize={9}
              fill="#64748b"
              fontWeight={600}
            >
              {label} {score}
            </text>
          )
        })}
      </svg>

      <p className="text-sm font-semibold text-slate-600">
        Overall TRACE: <span className="text-brand-600">{overall}/10</span>
      </p>
    </div>
  )
}
