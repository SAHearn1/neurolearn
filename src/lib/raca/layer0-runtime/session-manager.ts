import { useRuntimeStore } from './runtime-store'
import type { SessionConfig } from '../types/session'
import type { CognitiveState } from '../types/cognitive-states'
import type { RacaEvent } from '../types/events'

/**
 * Session Manager — high-level operations for session lifecycle.
 * All operations dispatch through the runtime store.
 */

function generateId(): string {
  return crypto.randomUUID()
}

function createEvent(
  sessionId: string,
  kind: RacaEvent['kind'],
  source: RacaEvent['source'],
  stateBefore: CognitiveState | null,
  stateAfter: CognitiveState | null,
  payload: Record<string, unknown> = {},
): RacaEvent {
  return {
    id: generateId(),
    session_id: sessionId,
    kind,
    source,
    timestamp: new Date().toISOString(),
    state_before: stateBefore,
    state_after: stateAfter,
    payload,
  }
}

export function startSession(userId: string, config: SessionConfig): string {
  const sessionId = generateId()
  const dispatch = useRuntimeStore.getState().dispatch

  dispatch({
    type: 'SESSION_STARTED',
    session_id: sessionId,
    user_id: userId,
    lesson_id: config.lesson_id,
    course_id: config.course_id,
  })

  const event = createEvent(sessionId, 'session_started', 'system', null, 'ROOT', {
    lesson_id: config.lesson_id,
    course_id: config.course_id,
  })
  dispatch({ type: 'EVENT_RECORDED', event })

  return sessionId
}

export function endSession(status: 'completed' | 'abandoned'): void {
  const { dispatch, session_id, current_state } = useRuntimeStore.getState()

  if (!session_id) return

  const event = createEvent(session_id, 'session_ended', 'system', current_state, null, { status })
  dispatch({ type: 'EVENT_RECORDED', event })
  dispatch({ type: 'SESSION_ENDED', status })
}

export function recordEvent(
  kind: RacaEvent['kind'],
  source: RacaEvent['source'],
  payload: Record<string, unknown> = {},
): void {
  const { dispatch, session_id, current_state } = useRuntimeStore.getState()
  if (!session_id) return

  const event = createEvent(session_id, kind, source, current_state, current_state, payload)
  dispatch({ type: 'EVENT_RECORDED', event })
}
