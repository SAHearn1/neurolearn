import { describe, expect, it } from 'vitest'
import { runtimeReducer, INITIAL_RUNTIME_STATE } from './runtime-reducer'
import type { RuntimeAction } from './runtime-reducer'

describe('runtimeReducer', () => {
  describe('SESSION_STARTED', () => {
    it('sets status to active and stores session/user ids', () => {
      const action: RuntimeAction = {
        type: 'SESSION_STARTED',
        session_id: 'sess-1',
        user_id: 'user-1',
        lesson_id: 'lesson-1',
        course_id: 'course-1',
      }
      const next = runtimeReducer(INITIAL_RUNTIME_STATE, action)
      expect(next.status).toBe('active')
      expect(next.session_id).toBe('sess-1')
      expect(next.user_id).toBe('user-1')
      expect(next.lesson_id).toBe('lesson-1')
      expect(next.course_id).toBe('course-1')
      expect(next.started_at).not.toBeNull()
    })

    it('resets artifacts and events from previous session', () => {
      const stateWithData = {
        ...INITIAL_RUNTIME_STATE,
        artifacts: [{ id: 'a1', kind: 'draft' } as never],
        events: [{ id: 'e1' } as never],
      }
      const action: RuntimeAction = {
        type: 'SESSION_STARTED',
        session_id: 'sess-2',
        user_id: 'user-2',
        lesson_id: 'lesson-2',
        course_id: 'course-2',
      }
      const next = runtimeReducer(stateWithData, action)
      expect(next.artifacts).toHaveLength(0)
      expect(next.events).toHaveLength(0)
    })
  })

  describe('SESSION_ENDED', () => {
    it('sets status to completed', () => {
      const state = { ...INITIAL_RUNTIME_STATE, status: 'active' as const }
      const next = runtimeReducer(state, { type: 'SESSION_ENDED', status: 'completed' })
      expect(next.status).toBe('completed')
    })

    it('sets status to abandoned', () => {
      const state = { ...INITIAL_RUNTIME_STATE, status: 'active' as const }
      const next = runtimeReducer(state, { type: 'SESSION_ENDED', status: 'abandoned' })
      expect(next.status).toBe('abandoned')
    })
  })

  describe('STATE_TRANSITIONED', () => {
    it('updates current_state and appends to state_history', () => {
      const next = runtimeReducer(INITIAL_RUNTIME_STATE, {
        type: 'STATE_TRANSITIONED',
        to: 'REGULATE',
      })
      expect(next.current_state).toBe('REGULATE')
      expect(next.state_history).toContain('REGULATE')
    })
  })

  describe('REGULATION_UPDATED', () => {
    it('clamps regulation level to [0, 100]', () => {
      const nextAbove = runtimeReducer(INITIAL_RUNTIME_STATE, {
        type: 'REGULATION_UPDATED',
        regulation: { ...INITIAL_RUNTIME_STATE.regulation, level: 150 },
      })
      expect(nextAbove.regulation.level).toBe(100)

      const nextBelow = runtimeReducer(INITIAL_RUNTIME_STATE, {
        type: 'REGULATION_UPDATED',
        regulation: { ...INITIAL_RUNTIME_STATE.regulation, level: -10 },
      })
      expect(nextBelow.regulation.level).toBe(0)
    })

    it('keeps level within range', () => {
      const next = runtimeReducer(INITIAL_RUNTIME_STATE, {
        type: 'REGULATION_UPDATED',
        regulation: { ...INITIAL_RUNTIME_STATE.regulation, level: 70 },
      })
      expect(next.regulation.level).toBe(70)
    })
  })

  describe('ARTIFACT_SAVED', () => {
    it('appends artifact to artifacts list', () => {
      const artifact = { id: 'art-1', kind: 'draft', content: 'test' } as never
      const next = runtimeReducer(INITIAL_RUNTIME_STATE, {
        type: 'ARTIFACT_SAVED',
        artifact,
      })
      expect(next.artifacts).toHaveLength(1)
      expect(next.artifacts[0].id).toBe('art-1')
    })
  })

  describe('EVENT_RECORDED', () => {
    it('appends event to events list', () => {
      const event = { id: 'evt-1', kind: 'agent_response' } as never
      const next = runtimeReducer(INITIAL_RUNTIME_STATE, {
        type: 'EVENT_RECORDED',
        event,
      })
      expect(next.events).toHaveLength(1)
      expect(next.events[0].id).toBe('evt-1')
    })
  })

  describe('EPISTEMIC_SNAPSHOT_ADDED', () => {
    it('appends snapshot to epistemic_snapshots', () => {
      const snapshot = { id: 'snap-1' } as never
      const next = runtimeReducer(INITIAL_RUNTIME_STATE, {
        type: 'EPISTEMIC_SNAPSHOT_ADDED',
        snapshot,
      })
      expect(next.epistemic_snapshots).toHaveLength(1)
    })
  })

  describe('SESSION_RESTORED', () => {
    it('replaces state with the restored state', () => {
      const restoredState = {
        ...INITIAL_RUNTIME_STATE,
        session_id: 'restored-sess',
        status: 'active' as const,
      }
      const next = runtimeReducer(INITIAL_RUNTIME_STATE, {
        type: 'SESSION_RESTORED',
        state: restoredState,
      })
      expect(next.session_id).toBe('restored-sess')
      expect(next.status).toBe('active')
    })
  })

  describe('SESSION_RESET', () => {
    it('returns initial state', () => {
      const activeState = {
        ...INITIAL_RUNTIME_STATE,
        session_id: 'sess-x',
        status: 'active' as const,
      }
      const next = runtimeReducer(activeState, { type: 'SESSION_RESET' })
      expect(next.session_id).toBeNull()
      expect(next.status).toBeNull()
    })
  })

  describe('unknown action', () => {
    it('returns state unchanged for unknown action type', () => {
      const next = runtimeReducer(INITIAL_RUNTIME_STATE, { type: 'UNKNOWN' } as never)
      expect(next).toEqual(INITIAL_RUNTIME_STATE)
    })
  })
})
