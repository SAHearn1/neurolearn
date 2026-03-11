import {
  STATE_METADATA,
  COGNITIVE_STATES,
  STUDENT_STATE_LABELS,
} from '../../lib/raca/types/cognitive-states'
import type { CognitiveState } from '../../lib/raca/types/cognitive-states'

interface Props {
  currentState: CognitiveState
  stateHistory: CognitiveState[]
}

const STATE_COLORS: Record<CognitiveState, string> = {
  ROOT: 'bg-amber-100 text-amber-800 border-amber-300',
  REGULATE: 'bg-blue-100 text-blue-800 border-blue-300',
  POSITION: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  PLAN: 'bg-purple-100 text-purple-800 border-purple-300',
  APPLY: 'bg-green-100 text-green-800 border-green-300',
  REVISE: 'bg-orange-100 text-orange-800 border-orange-300',
  DEFEND: 'bg-red-100 text-red-800 border-red-300',
  RECONNECT: 'bg-teal-100 text-teal-800 border-teal-300',
  ARCHIVE: 'bg-slate-100 text-slate-800 border-slate-300',
}

export function CognitiveStateIndicator({ currentState, stateHistory }: Props) {
  const meta = STATE_METADATA[currentState]
  const stateIndex = COGNITIVE_STATES.indexOf(currentState)
  const progress = Math.round(((stateIndex + 1) / COGNITIVE_STATES.length) * 100)

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${STATE_COLORS[currentState]}`}
        >
          {STUDENT_STATE_LABELS[currentState]?.label ?? meta.label}
        </span>
        <span className="text-xs text-slate-500">{progress}% through session</span>
      </div>
      <p className="mb-3 text-sm text-slate-600">{meta.description}</p>
      <div className="flex gap-1">
        {COGNITIVE_STATES.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full ${
              i <= stateIndex
                ? 'bg-brand-500'
                : stateHistory.includes(s)
                  ? 'bg-brand-200'
                  : 'bg-slate-100'
            }`}
            title={STUDENT_STATE_LABELS[s]?.label ?? STATE_METADATA[s].label}
          />
        ))}
      </div>
    </div>
  )
}
