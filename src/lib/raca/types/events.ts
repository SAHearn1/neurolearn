import type { CognitiveState } from './cognitive-states'

/**
 * RACA Event System — all state changes flow through typed events.
 * Events are the ONLY way to mutate runtime state.
 */

export type EventSource = 'learner_action' | 'system' | 'agent_response' | 'timer'

export type EventKind =
  | 'session_started'
  | 'session_ended'
  | 'state_transition'
  | 'regulation_check'
  | 'artifact_saved'
  | 'agent_invoked'
  | 'agent_responded'
  | 'agent_blocked'
  | 'reflection_submitted'
  | 'draft_submitted'
  | 'revision_submitted'
  | 'defense_submitted'
  | 'dysregulation_detected'
  | 'intervention_started'
  | 'intervention_dismissed'
  | 'precondition_failed'

export interface RacaEvent {
  id: string
  session_id: string
  kind: EventKind
  source: EventSource
  timestamp: string
  state_before: CognitiveState | null
  state_after: CognitiveState | null
  payload: Record<string, unknown>
}

export type RacaEventInput = Omit<RacaEvent, 'id' | 'timestamp'>
