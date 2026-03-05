/**
 * LEARNING Event Bus — spec §XI.
 *
 * Defines the public LEARNING.* event namespace that the Agent Router
 * and other subscribers observe. These events are the contract between
 * runtime layers and are never triggered by AI agents — only by
 * learner actions and the state machine.
 *
 * Events:
 *   LEARNING.STATE_ENTERED      — learner has entered a new cognitive state
 *   LEARNING.STATE_COMPLETED    — learner has completed and departed a cognitive state
 *   LEARNING.DRAFT_SUBMITTED    — learner submitted a draft artifact
 *   LEARNING.REVISION_SUBMITTED — learner submitted a revision artifact
 *   LEARNING.DEFENSE_COMPLETED  — learner completed the DEFEND state
 */

import type { CognitiveState } from './types/cognitive-states'
import type { ArtifactKind } from './types/artifacts'
import { useRuntimeStore } from './layer0-runtime/runtime-store'

// ── Types ──────────────────────────────────────────────────────────────────

export type LearningEventType =
  | 'LEARNING.STATE_ENTERED'
  | 'LEARNING.STATE_COMPLETED'
  | 'LEARNING.DRAFT_SUBMITTED'
  | 'LEARNING.REVISION_SUBMITTED'
  | 'LEARNING.DEFENSE_COMPLETED'

export interface LearningEvent {
  type: LearningEventType
  sessionId: string
  timestamp: string
  payload: Record<string, unknown>
}

type LearningEventListener = (event: LearningEvent) => void

// ── Event Registry ─────────────────────────────────────────────────────────

const listeners = new Map<LearningEventType, Set<LearningEventListener>>()

/**
 * Subscribe to a LEARNING event.
 * Returns an unsubscribe function.
 */
export function onLearningEvent(
  type: LearningEventType,
  listener: LearningEventListener,
): () => void {
  if (!listeners.has(type)) listeners.set(type, new Set())
  listeners.get(type)!.add(listener)
  return () => listeners.get(type)?.delete(listener)
}

/**
 * Emit a LEARNING event to all registered listeners.
 * Called only by runtime internals — never by AI agents.
 */
export function emitLearningEvent(
  type: LearningEventType,
  sessionId: string,
  payload: Record<string, unknown> = {},
): void {
  const event: LearningEvent = {
    type,
    sessionId,
    timestamp: new Date().toISOString(),
    payload,
  }
  listeners.get(type)?.forEach((listener) => {
    try {
      listener(event)
    } catch (err) {
      console.error('[LearningEvents] Listener error:', err)
    }
  })
}

// ── Artifact-based event bridge ────────────────────────────────────────────
// Watches the runtime store for new artifacts and emits LEARNING.* events
// when draft and revision artifacts are saved. This preserves separation of
// concerns — the reducer stays pure, the event bus reacts from outside.

const ARTIFACT_EVENT_MAP: Partial<Record<ArtifactKind, LearningEventType>> = {
  draft: 'LEARNING.DRAFT_SUBMITTED',
  revision: 'LEARNING.REVISION_SUBMITTED',
}

let _trackedArtifactCount = 0

useRuntimeStore.subscribe((state) => {
  const current = state.artifacts
  if (!state.session_id || current.length <= _trackedArtifactCount) {
    _trackedArtifactCount = current.length
    return
  }

  // Emit events for each new artifact since last check
  for (let i = _trackedArtifactCount; i < current.length; i++) {
    const artifact = current[i]
    const eventType = ARTIFACT_EVENT_MAP[artifact.kind]
    if (eventType) {
      emitLearningEvent(eventType, state.session_id, {
        artifact_id: artifact.id,
        kind: artifact.kind,
        word_count: artifact.word_count,
        state: artifact.state,
      })
    }
  }

  _trackedArtifactCount = current.length
})

// ── State transition bridge ────────────────────────────────────────────────
// Emitted from state-machine.ts after successful transitions.
// Exposed here for import by state-machine without circular dependency.

/**
 * Emit STATE_ENTERED and STATE_COMPLETED for a given transition.
 * Called by the state machine after a successful transition.
 */
export function emitStateTransitionEvents(
  sessionId: string,
  from: CognitiveState,
  to: CognitiveState,
): void {
  // The outgoing state is completed
  emitLearningEvent('LEARNING.STATE_COMPLETED', sessionId, { state: from, transitioned_to: to })

  // The incoming state is entered
  emitLearningEvent('LEARNING.STATE_ENTERED', sessionId, { state: to, transitioned_from: from })

  // Special: DEFEND → RECONNECT means defense is complete
  if (from === 'DEFEND' && to === 'RECONNECT') {
    emitLearningEvent('LEARNING.DEFENSE_COMPLETED', sessionId, { from, to })
  }
}
