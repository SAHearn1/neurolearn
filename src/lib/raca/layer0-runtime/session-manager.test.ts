import { describe, it, expect, beforeEach } from 'vitest'
import { startSession, endSession, recordEvent } from './session-manager'
import { useRuntimeStore } from './runtime-store'
import { INITIAL_RUNTIME_STATE } from './runtime-reducer'

describe('Session Manager', () => {
  beforeEach(() => {
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

    it('does nothing when no active session exists', () => {
      useRuntimeStore.setState(INITIAL_RUNTIME_STATE)
      expect(() => endSession('completed')).not.toThrow()
      expect(useRuntimeStore.getState().status).toBeNull()
    })
  })

  describe('recordEvent', () => {
    it('does not throw when no active session', () => {
      expect(() => recordEvent('agent_responded', 'agent_response', { foo: 'bar' })).not.toThrow()
    })

    it('records an event into the store when session is active', () => {
      startSession('user-1', { lesson_id: 'lesson-1', course_id: 'course-1' })
      const initialCount = useRuntimeStore.getState().events.length
      recordEvent('agent_responded', 'agent_response', { result: 'ok' })
      expect(useRuntimeStore.getState().events.length).toBe(initialCount + 1)
    })

    it('records event with the correct kind', () => {
      startSession('user-1', { lesson_id: 'lesson-1', course_id: 'course-1' })
      recordEvent('state_transition', 'system', {})
      const { events } = useRuntimeStore.getState()
      expect(events.some((e) => e.kind === 'state_transition')).toBe(true)
    })
  })
})
