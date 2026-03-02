import { useCallback } from 'react'
import { useRuntimeStore } from '../lib/raca/layer0-runtime/runtime-store'
import { requestTransition } from '../lib/raca/layer1-cognitive-fsm/state-machine'
import { buildCognitiveSnapshot } from '../lib/raca/layer1-cognitive-fsm/snapshot'
import { isValidTransition } from '../lib/raca/layer1-cognitive-fsm/transition-guards'
import { STATE_METADATA, COGNITIVE_STATES } from '../lib/raca/types/cognitive-states'
import type { CognitiveState } from '../lib/raca/types/cognitive-states'

export function useCognitiveState() {
  const currentState = useRuntimeStore((s) => s.current_state)
  const stateHistory = useRuntimeStore((s) => s.state_history)
  const regulation = useRuntimeStore((s) => s.regulation)

  const transition = useCallback(
    (to: CognitiveState, payload?: Record<string, unknown>) => {
      return requestTransition(to, 'learner_action', payload)
    },
    [],
  )

  const canTransitionTo = useCallback(
    (to: CognitiveState) => isValidTransition(currentState, to),
    [currentState],
  )

  const nextStates = COGNITIVE_STATES.filter((s) =>
    isValidTransition(currentState, s),
  )

  const snapshot = useCallback(() => buildCognitiveSnapshot(), [])

  return {
    currentState,
    stateHistory,
    metadata: STATE_METADATA[currentState],
    regulation,
    nextStates,
    transition,
    canTransitionTo,
    snapshot,
  }
}
