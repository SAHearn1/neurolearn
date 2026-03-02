import { describe, expect, it } from 'vitest'
import { useProgressStore } from './progressStore'

describe('useProgressStore', () => {
  it('starts with empty state', () => {
    const state = useProgressStore.getState()
    expect(state.lessonProgress).toEqual({})
    expect(state.courseProgress).toEqual({})
    expect(state.loading).toBe(false)
  })

  it('resets state', () => {
    useProgressStore.getState().reset()
    const state = useProgressStore.getState()
    expect(state.lessonProgress).toEqual({})
    expect(state.courseProgress).toEqual({})
  })
})
