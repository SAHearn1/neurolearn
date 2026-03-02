import type { CognitiveState } from './cognitive-states'
import type { Artifact } from './artifacts'
import type { RacaEvent } from './events'
import type { RegulationState, EpistemicSnapshot } from './epistemic'

/**
 * RACA Session — the root container for a single learning session.
 */

export type SessionStatus = 'active' | 'paused' | 'completed' | 'abandoned'

export interface RacaSession {
  id: string
  user_id: string
  lesson_id: string
  course_id: string
  status: SessionStatus
  current_state: CognitiveState
  state_history: CognitiveState[]
  regulation: RegulationState
  artifacts: Artifact[]
  events: RacaEvent[]
  epistemic_snapshots: EpistemicSnapshot[]
  started_at: string
  updated_at: string
  completed_at: string | null
}

export interface SessionConfig {
  lesson_id: string
  course_id: string
  initial_regulation_level?: number
}

export type SessionSummary = Pick<
  RacaSession,
  'id' | 'lesson_id' | 'course_id' | 'status' | 'current_state' | 'started_at' | 'completed_at'
>
