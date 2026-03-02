import type { CognitiveState } from './cognitive-states'

/**
 * RACA Artifacts — learner-produced work products at each state.
 * Artifacts are immutable once saved (append-only versioning).
 */

export type ArtifactKind =
  | 'reflection'
  | 'position_frame'
  | 'plan_outline'
  | 'draft'
  | 'revision'
  | 'defense_response'
  | 'reconnection_reflection'

export interface Artifact {
  id: string
  session_id: string
  kind: ArtifactKind
  state: CognitiveState
  content: string
  word_count: number
  version: number
  created_at: string
}

export type ArtifactInput = Omit<Artifact, 'id' | 'created_at' | 'word_count'>
