import type { CognitiveState } from '../types/cognitive-states'
import type { RuntimeState } from '../layer0-runtime/runtime-reducer'
import { checkPrecondition, type PreconditionResult } from '../layer1-cognitive-fsm/preconditions'

/**
 * Precondition Enforcer — centralized enforcement point for state preconditions.
 * Used by UI components to show/hide actions and by the router to gate transitions.
 */

export interface EnforcementResult {
  state: CognitiveState
  precondition: PreconditionResult
  canProceed: boolean
  hint: string
}

const HINTS: Partial<Record<CognitiveState, string>> = {
  POSITION: 'Complete the regulation check to continue.',
  PLAN: 'Share your initial reflection or position frame first.',
  APPLY: 'Create a plan outline before building your draft.',
  REVISE: 'Submit your draft before moving to revision.',
  DEFEND: 'Complete your revision to begin defending your work.',
  RECONNECT: 'Respond to the defense questions first.',
  ARCHIVE: 'Write your reconnection reflection to complete the session.',
}

export function enforcePreconditions(
  targetState: CognitiveState,
  runtimeState: RuntimeState,
): EnforcementResult {
  const result = checkPrecondition(targetState, runtimeState)

  return {
    state: targetState,
    precondition: result,
    canProceed: result.met,
    hint: result.met ? '' : HINTS[targetState] ?? result.reason,
  }
}

export function getBlockedStatesWithHints(runtimeState: RuntimeState): EnforcementResult[] {
  const states: CognitiveState[] = [
    'POSITION', 'PLAN', 'APPLY', 'REVISE', 'DEFEND', 'RECONNECT', 'ARCHIVE',
  ]

  return states
    .map((s) => enforcePreconditions(s, runtimeState))
    .filter((r) => !r.canProceed)
}
