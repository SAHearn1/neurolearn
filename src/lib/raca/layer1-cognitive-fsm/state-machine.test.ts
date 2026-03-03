import { describe, expect, it } from 'vitest'
import { isValidTransition, evaluateTransition } from './transition-guards'
import { checkPrecondition } from './preconditions'
import { INITIAL_RUNTIME_STATE } from '../layer0-runtime/runtime-reducer'
import type { RuntimeState } from '../layer0-runtime/runtime-reducer'

describe('Cognitive State Machine', () => {
  describe('isValidTransition', () => {
    it('allows ROOT -> REGULATE', () => {
      expect(isValidTransition('ROOT', 'REGULATE')).toBe(true)
    })

    it('allows REGULATE -> POSITION', () => {
      expect(isValidTransition('REGULATE', 'POSITION')).toBe(true)
    })

    it('allows forward transitions through the full path', () => {
      const path = [
        'ROOT',
        'REGULATE',
        'POSITION',
        'PLAN',
        'APPLY',
        'REVISE',
        'DEFEND',
        'RECONNECT',
        'ARCHIVE',
      ] as const
      for (let i = 0; i < path.length - 1; i++) {
        expect(isValidTransition(path[i], path[i + 1])).toBe(true)
      }
    })

    it('disallows skipping states', () => {
      expect(isValidTransition('ROOT', 'POSITION')).toBe(false)
      expect(isValidTransition('REGULATE', 'APPLY')).toBe(false)
    })

    it('allows backward transition to REGULATE from any state except ROOT and ARCHIVE', () => {
      const states = ['POSITION', 'PLAN', 'APPLY', 'REVISE', 'DEFEND', 'RECONNECT'] as const
      for (const state of states) {
        expect(isValidTransition(state, 'REGULATE')).toBe(true)
      }
    })

    it('disallows transitions from ARCHIVE', () => {
      expect(isValidTransition('ARCHIVE', 'ROOT')).toBe(false)
      expect(isValidTransition('ARCHIVE', 'REGULATE')).toBe(false)
    })
  })

  describe('evaluateTransition', () => {
    it('blocks non-learner forward transitions', () => {
      const result = evaluateTransition('REGULATE', 'POSITION', 'agent_response', {
        ...INITIAL_RUNTIME_STATE,
        regulation: { ...INITIAL_RUNTIME_STATE.regulation, level: 80 },
      })
      expect(result.allowed).toBe(false)
      expect(result.reason).toContain('Only learner_action')
    })

    it('allows system transitions to REGULATE', () => {
      const result = evaluateTransition('POSITION', 'REGULATE', 'system', INITIAL_RUNTIME_STATE)
      expect(result.allowed).toBe(true)
    })
  })

  describe('checkPrecondition', () => {
    it('ROOT has no preconditions', () => {
      const result = checkPrecondition('ROOT', INITIAL_RUNTIME_STATE)
      expect(result.met).toBe(true)
    })

    it('REGULATE is always accessible', () => {
      const result = checkPrecondition('REGULATE', INITIAL_RUNTIME_STATE)
      expect(result.met).toBe(true)
    })

    it('POSITION requires regulation >= 60', () => {
      const lowReg: RuntimeState = {
        ...INITIAL_RUNTIME_STATE,
        regulation: { ...INITIAL_RUNTIME_STATE.regulation, level: 50 },
      }
      expect(checkPrecondition('POSITION', lowReg).met).toBe(false)

      const highReg: RuntimeState = {
        ...INITIAL_RUNTIME_STATE,
        regulation: { ...INITIAL_RUNTIME_STATE.regulation, level: 70 },
      }
      expect(checkPrecondition('POSITION', highReg).met).toBe(true)
    })

    it('PLAN requires reflection or position frame artifact', () => {
      expect(checkPrecondition('PLAN', INITIAL_RUNTIME_STATE).met).toBe(false)

      const withArtifact: RuntimeState = {
        ...INITIAL_RUNTIME_STATE,
        artifacts: [
          {
            id: '1',
            session_id: 's1',
            kind: 'position_frame',
            state: 'POSITION',
            content: 'test',
            word_count: 1,
            version: 1,
            created_at: '',
          },
        ],
      }
      expect(checkPrecondition('PLAN', withArtifact).met).toBe(true)
    })
  })
})
