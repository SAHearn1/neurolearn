import { describe, expect, it } from 'vitest'
import { checkPrecondition } from './preconditions'
import { INITIAL_RUNTIME_STATE } from '../layer0-runtime/runtime-reducer'
import type { RuntimeState } from '../layer0-runtime/runtime-reducer'

const baseState: RuntimeState = {
  ...INITIAL_RUNTIME_STATE,
  regulation: {
    ...INITIAL_RUNTIME_STATE.regulation,
    level: 75,
  },
}

describe('checkPrecondition', () => {
  it('passes for ROOT with no conditions', () => {
    const result = checkPrecondition('ROOT', baseState)
    expect(result.met).toBe(true)
  })

  it('passes for REGULATE always', () => {
    const result = checkPrecondition('REGULATE', baseState)
    expect(result.met).toBe(true)
  })

  it('passes for POSITION when regulation level >= 60', () => {
    const result = checkPrecondition('POSITION', {
      ...baseState,
      regulation: { ...baseState.regulation, level: 60 },
    })
    expect(result.met).toBe(true)
  })

  it('fails for POSITION when regulation level < 60', () => {
    const result = checkPrecondition('POSITION', {
      ...baseState,
      regulation: { ...baseState.regulation, level: 50 },
    })
    expect(result.met).toBe(false)
    expect(result.reason).toMatch(/below 60/)
  })

  it('fails for PLAN when no reflection artifact exists', () => {
    const result = checkPrecondition('PLAN', { ...baseState, artifacts: [] })
    expect(result.met).toBe(false)
  })

  it('passes for PLAN when reflection artifact exists', () => {
    const artifact = {
      id: 'a1',
      kind: 'reflection',
      content: 'x',
      session_id: 's1',
      state: 'POSITION',
      created_at: '',
    } as never
    const result = checkPrecondition('PLAN', { ...baseState, artifacts: [artifact] })
    expect(result.met).toBe(true)
  })

  it('passes for PLAN when position_frame artifact exists', () => {
    const artifact = {
      id: 'a2',
      kind: 'position_frame',
      content: 'x',
      session_id: 's1',
      state: 'POSITION',
      created_at: '',
    } as never
    const result = checkPrecondition('PLAN', { ...baseState, artifacts: [artifact] })
    expect(result.met).toBe(true)
  })

  it('fails for APPLY when no plan_outline exists', () => {
    const result = checkPrecondition('APPLY', { ...baseState, artifacts: [] })
    expect(result.met).toBe(false)
  })

  it('passes for APPLY when plan_outline exists', () => {
    const artifact = { id: 'a3', kind: 'plan_outline' } as never
    const result = checkPrecondition('APPLY', { ...baseState, artifacts: [artifact] })
    expect(result.met).toBe(true)
  })

  it('fails for REVISE when no draft exists', () => {
    const result = checkPrecondition('REVISE', { ...baseState, artifacts: [] })
    expect(result.met).toBe(false)
  })

  it('passes for REVISE when draft exists', () => {
    const artifact = { id: 'a4', kind: 'draft' } as never
    const result = checkPrecondition('REVISE', { ...baseState, artifacts: [artifact] })
    expect(result.met).toBe(true)
  })

  it('fails for DEFEND when no revision exists', () => {
    const result = checkPrecondition('DEFEND', { ...baseState, artifacts: [] })
    expect(result.met).toBe(false)
  })

  it('passes for DEFEND when revision exists', () => {
    const artifact = { id: 'a5', kind: 'revision' } as never
    const result = checkPrecondition('DEFEND', { ...baseState, artifacts: [artifact] })
    expect(result.met).toBe(true)
  })

  it('fails for RECONNECT when no defense_response exists', () => {
    const result = checkPrecondition('RECONNECT', { ...baseState, artifacts: [] })
    expect(result.met).toBe(false)
  })

  it('passes for RECONNECT when defense_response exists', () => {
    const artifact = { id: 'a6', kind: 'defense_response' } as never
    const result = checkPrecondition('RECONNECT', { ...baseState, artifacts: [artifact] })
    expect(result.met).toBe(true)
  })

  it('fails for ARCHIVE when no reconnection_reflection exists', () => {
    const result = checkPrecondition('ARCHIVE', { ...baseState, artifacts: [] })
    expect(result.met).toBe(false)
  })

  it('passes for ARCHIVE when reconnection_reflection exists', () => {
    const artifact = { id: 'a7', kind: 'reconnection_reflection' } as never
    const result = checkPrecondition('ARCHIVE', { ...baseState, artifacts: [artifact] })
    expect(result.met).toBe(true)
  })

  it('passes for any state without explicit preconditions', () => {
    // Use a made-up state to hit the default case
    const result = checkPrecondition('UNKNOWN_STATE' as never, baseState)
    expect(result.met).toBe(true)
  })
})
