import type { CognitiveState } from '../types/cognitive-states'
import type { RacaEvent } from '../types/events'
import type { Artifact } from '../types/artifacts'
import type { RegulationState, EpistemicSnapshot } from '../types/epistemic'
import type { SessionStatus } from '../types/session'

/**
 * Layer 0 Runtime Reducer — immutable state transitions via events.
 * All state mutations flow through this reducer. Direct mutation is never allowed.
 */

export interface RuntimeState {
  session_id: string | null
  user_id: string | null
  lesson_id: string | null
  course_id: string | null
  status: SessionStatus | null
  current_state: CognitiveState
  state_history: CognitiveState[]
  regulation: RegulationState
  artifacts: Artifact[]
  events: RacaEvent[]
  epistemic_snapshots: EpistemicSnapshot[]
  started_at: string | null
  updated_at: string | null
}

export const INITIAL_RUNTIME_STATE: RuntimeState = {
  session_id: null,
  user_id: null,
  lesson_id: null,
  course_id: null,
  status: null,
  current_state: 'ROOT',
  state_history: ['ROOT'],
  regulation: {
    level: 75,
    signals: [],
    intervention_active: false,
    intervention_count: 0,
    last_check: '',
  },
  artifacts: [],
  events: [],
  epistemic_snapshots: [],
  started_at: null,
  updated_at: null,
}

export type RuntimeAction =
  | {
      type: 'SESSION_STARTED'
      session_id: string
      user_id: string
      lesson_id: string
      course_id: string
    }
  | { type: 'SESSION_ENDED'; status: 'completed' | 'abandoned' }
  | { type: 'STATE_TRANSITIONED'; to: CognitiveState }
  | { type: 'REGULATION_UPDATED'; regulation: RegulationState }
  | { type: 'ARTIFACT_SAVED'; artifact: Artifact }
  | { type: 'EVENT_RECORDED'; event: RacaEvent }
  | { type: 'EPISTEMIC_SNAPSHOT_ADDED'; snapshot: EpistemicSnapshot }
  | { type: 'SESSION_RESTORED'; state: RuntimeState }
  | { type: 'SESSION_RESET' }

export function runtimeReducer(state: RuntimeState, action: RuntimeAction): RuntimeState {
  const now = new Date().toISOString()

  switch (action.type) {
    case 'SESSION_STARTED':
      return {
        ...INITIAL_RUNTIME_STATE,
        session_id: action.session_id,
        user_id: action.user_id,
        lesson_id: action.lesson_id,
        course_id: action.course_id,
        status: 'active',
        started_at: now,
        updated_at: now,
        regulation: { ...INITIAL_RUNTIME_STATE.regulation, last_check: now },
      }

    case 'SESSION_ENDED':
      return {
        ...state,
        status: action.status,
        updated_at: now,
      }

    case 'STATE_TRANSITIONED':
      return {
        ...state,
        current_state: action.to,
        state_history: [...state.state_history, action.to],
        updated_at: now,
      }

    case 'REGULATION_UPDATED':
      return {
        ...state,
        regulation: {
          ...action.regulation,
          level: Math.max(0, Math.min(100, action.regulation.level)),
        },
        updated_at: now,
      }

    case 'ARTIFACT_SAVED':
      return {
        ...state,
        artifacts: [...state.artifacts, action.artifact],
        updated_at: now,
      }

    case 'EVENT_RECORDED':
      return {
        ...state,
        events: [...state.events, action.event],
        updated_at: now,
      }

    case 'EPISTEMIC_SNAPSHOT_ADDED':
      return {
        ...state,
        epistemic_snapshots: [...state.epistemic_snapshots, action.snapshot],
        updated_at: now,
      }

    case 'SESSION_RESTORED':
      return { ...action.state }

    case 'SESSION_RESET':
      return { ...INITIAL_RUNTIME_STATE }

    default:
      return state
  }
}
