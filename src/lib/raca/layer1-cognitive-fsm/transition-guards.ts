import type { CognitiveState } from '../types/cognitive-states'
import type { EventSource } from '../types/events'
import type { RuntimeState } from '../layer0-runtime/runtime-reducer'
import { checkPrecondition } from './preconditions'

/**
 * Transition Guards — validate whether a transition is allowed.
 *
 * CRITICAL CONSTRAINT: Only 'learner_action' events can trigger
 * forward state transitions. AI agents cannot advance the learner
 * through the cognitive sequence.
 */

export interface TransitionGuardResult {
  allowed: boolean
  reason: string
}

/** The definitive transition table — null means transition is forbidden */
const TRANSITIONS: Record<CognitiveState, Partial<Record<CognitiveState, true>>> = {
  ROOT: { REGULATE: true },
  REGULATE: { POSITION: true },
  POSITION: { PLAN: true, REGULATE: true },
  PLAN: { APPLY: true, REGULATE: true },
  APPLY: { REVISE: true, REGULATE: true },
  REVISE: { DEFEND: true, REGULATE: true },
  DEFEND: { RECONNECT: true, REGULATE: true },
  RECONNECT: { ARCHIVE: true, REGULATE: true },
  ARCHIVE: {},
}

export function isValidTransition(from: CognitiveState, to: CognitiveState): boolean {
  return TRANSITIONS[from]?.[to] === true
}

export function evaluateTransition(
  from: CognitiveState,
  to: CognitiveState,
  source: EventSource,
  runtimeState: RuntimeState,
): TransitionGuardResult {
  // Guard 1: Only learner actions can trigger forward transitions
  // (backward transitions to REGULATE are allowed from system/timer for dysregulation)
  if (source !== 'learner_action' && to !== 'REGULATE') {
    return { allowed: false, reason: `Only learner_action can trigger transition to ${to}` }
  }

  // Guard 2: Check transition validity
  if (!isValidTransition(from, to)) {
    return { allowed: false, reason: `Transition from ${from} to ${to} is not allowed` }
  }

  // Guard 3: Check preconditions for the target state
  const precondition = checkPrecondition(to, runtimeState)
  if (!precondition.met) {
    return { allowed: false, reason: precondition.reason }
  }

  return { allowed: true, reason: 'Transition approved' }
}
