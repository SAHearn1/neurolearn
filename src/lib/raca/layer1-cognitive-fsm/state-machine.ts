import type { CognitiveState } from '../types/cognitive-states'
import type { EventSource, RacaEvent } from '../types/events'
import { useRuntimeStore } from '../layer0-runtime/runtime-store'
import { appendAuditEvent } from '../layer0-runtime/audit-trail'
import { evaluateTransition } from './transition-guards'
import { racaFlags } from '../feature-flags'

/**
 * Cognitive State Machine — the entry point for all state transitions.
 * Enforces guards, dispatches events, and records audit trail.
 */

export interface TransitionResult {
  success: boolean
  from: CognitiveState
  to: CognitiveState
  reason: string
}

export function requestTransition(
  to: CognitiveState,
  source: EventSource,
  payload: Record<string, unknown> = {},
): TransitionResult {
  if (!racaFlags.cognitiveFsm) {
    return { success: false, from: 'ROOT', to, reason: 'Cognitive FSM is disabled' }
  }

  const store = useRuntimeStore.getState()
  const from = store.current_state
  const { dispatch: _, ...runtimeState } = store

  const guard = evaluateTransition(from, to, source, runtimeState)

  if (!guard.allowed) {
    // Record blocked transition event
    const blockedEvent: RacaEvent = {
      id: crypto.randomUUID(),
      session_id: runtimeState.session_id ?? '',
      kind: 'precondition_failed',
      source,
      timestamp: new Date().toISOString(),
      state_before: from,
      state_after: null,
      payload: { attempted_to: to, reason: guard.reason, ...payload },
    }
    store.dispatch({ type: 'EVENT_RECORDED', event: blockedEvent })
    appendAuditEvent(blockedEvent)

    return { success: false, from, to, reason: guard.reason }
  }

  // Execute the transition
  store.dispatch({ type: 'STATE_TRANSITIONED', to })

  // Record the transition event
  const transitionEvent: RacaEvent = {
    id: crypto.randomUUID(),
    session_id: runtimeState.session_id ?? '',
    kind: 'state_transition',
    source,
    timestamp: new Date().toISOString(),
    state_before: from,
    state_after: to,
    payload,
  }
  store.dispatch({ type: 'EVENT_RECORDED', event: transitionEvent })
  appendAuditEvent(transitionEvent)

  return { success: true, from, to, reason: 'Transition approved' }
}

export function getCurrentState(): CognitiveState {
  return useRuntimeStore.getState().current_state
}

export function getStateHistory(): CognitiveState[] {
  return useRuntimeStore.getState().state_history
}
