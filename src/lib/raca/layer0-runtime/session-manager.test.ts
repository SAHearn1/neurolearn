import { describe, it, expect, beforeEach } from 'vitest'
import { startSession, endSession } from './session-manager'
import { useRuntimeStore } from './runtime-store'
import { INITIAL_RUNTIME_STATE } from './runtime-reducer'

/**
 * Session Manager — unit tests confirming that the RACA engine initialises
 * correctly and that the session lifecycle (start → end) works as expected.
 */
describe('Session Manager', () => {
  beforeEach(() => {
    // Reset store to initial state between tests while preserving dispatch.
    useRuntimeStore.setState(INITIAL_RUNTIME_STATE)
  })

  describe('startSession — engine initialisation', () => {
    it('sets session status to active', () => {
      startSession('user-1', { lesson_id: 'lesson-1', course_id: 'course-1' })
      expect(useRuntimeStore.getState().status).toBe('active')
    })

    it('stores the user, lesson, and course IDs', () => {
      startSession('user-42', { lesson_id: 'lesson-7', course_id: 'course-3' })
      const state = useRuntimeStore.getState()
      expect(state.user_id).toBe('user-42')
      expect(state.lesson_id).toBe('lesson-7')
      expect(state.course_id).toBe('course-3')
    })

    it('returns a non-empty session ID string', () => {
      const sessionId = startSession('user-1', { lesson_id: 'lesson-1', course_id: 'course-1' })
      expect(typeof sessionId).toBe('string')
      expect(sessionId.length).toBeGreaterThan(0)
    })

    it('starts cognitive state at ROOT', () => {
      startSession('user-1', { lesson_id: 'lesson-1', course_id: 'course-1' })
      expect(useRuntimeStore.getState().current_state).toBe('ROOT')
    })

    it('records a session_started event in the event log', () => {
      startSession('user-1', { lesson_id: 'lesson-1', course_id: 'course-1' })
      const { events } = useRuntimeStore.getState()
      expect(events.some((e) => e.kind === 'session_started')).toBe(true)
    })

    it('persists the session ID inside the event', () => {
      const sessionId = startSession('user-1', { lesson_id: 'lesson-1', course_id: 'course-1' })
      const { events } = useRuntimeStore.getState()
      const startEvent = events.find((e) => e.kind === 'session_started')
      expect(startEvent?.session_id).toBe(sessionId)
    })

    it('sets a started_at timestamp', () => {
      startSession('user-1', { lesson_id: 'lesson-1', course_id: 'course-1' })
      expect(useRuntimeStore.getState().started_at).not.toBeNull()
    })
  })

  describe('endSession — session lifecycle', () => {
    beforeEach(() => {
      startSession('user-1', { lesson_id: 'lesson-1', course_id: 'course-1' })
    })

    it('marks session as completed', () => {
      endSession('completed')
      expect(useRuntimeStore.getState().status).toBe('completed')
    })

    it('marks session as abandoned', () => {
      endSession('abandoned')
      expect(useRuntimeStore.getState().status).toBe('abandoned')
    })

    it('records a session_ended event', () => {
      endSession('completed')
      const { events } = useRuntimeStore.getState()
      expect(events.some((e) => e.kind === 'session_ended')).toBe(true)
    })
  })
})
