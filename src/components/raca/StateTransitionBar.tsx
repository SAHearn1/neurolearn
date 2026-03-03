import { Button } from '../ui/Button'
import type { CognitiveState } from '../../lib/raca/types/cognitive-states'
import { STATE_METADATA } from '../../lib/raca/types/cognitive-states'

interface Props {
  currentState: CognitiveState
  nextStates: CognitiveState[]
  onTransition: (to: CognitiveState) => void
  disabled?: boolean
  hint?: string
}

export function StateTransitionBar({
  currentState,
  nextStates,
  onTransition,
  disabled,
  hint,
}: Props) {
  const forwardStates = nextStates.filter((s) => s !== 'REGULATE')
  const canRegulate = nextStates.includes('REGULATE')

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {forwardStates.map((s) => (
            <Button key={s} onClick={() => onTransition(s)} disabled={disabled} variant="primary">
              Move to {STATE_METADATA[s].label}
            </Button>
          ))}
          {canRegulate && (
            <Button onClick={() => onTransition('REGULATE')} variant="secondary">
              Back to Regulate
            </Button>
          )}
        </div>
        <span className="text-xs text-slate-500">
          Currently: {STATE_METADATA[currentState].label}
        </span>
      </div>
      {hint && <p className="mt-2 text-sm text-amber-600">{hint}</p>}
    </div>
  )
}
