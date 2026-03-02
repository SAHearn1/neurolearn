import type { CognitiveState } from '../types/cognitive-states'
import { useRuntimeStore } from '../layer0-runtime/runtime-store'

/**
 * Snapshot — immutable point-in-time capture of cognitive state.
 * Used for audit, debugging, and session replay.
 */

export interface CognitiveSnapshot {
  state: CognitiveState
  history: CognitiveState[]
  regulation_level: number
  artifact_count: number
  event_count: number
  timestamp: string
}

export function buildCognitiveSnapshot(): CognitiveSnapshot {
  const store = useRuntimeStore.getState()

  return {
    state: store.current_state,
    history: [...store.state_history],
    regulation_level: store.regulation.level,
    artifact_count: store.artifacts.length,
    event_count: store.events.length,
    timestamp: new Date().toISOString(),
  }
}

export function buildSnapshotFromState(
  state: CognitiveState,
  history: CognitiveState[],
  regulationLevel: number,
  artifactCount: number,
  eventCount: number,
): CognitiveSnapshot {
  return {
    state,
    history: [...history],
    regulation_level: regulationLevel,
    artifact_count: artifactCount,
    event_count: eventCount,
    timestamp: new Date().toISOString(),
  }
}
