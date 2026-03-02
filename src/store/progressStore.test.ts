import { describe, expect, it } from 'vitest'
import { useProgressStore } from './progressStore'

describe('useProgressStore', () => {
  it('replaces progress items', () => {
    useProgressStore.setState({ items: [] })

    useProgressStore.getState().setItems([
      {
        completed: true,
        id: 'p1',
        lessonId: 'l1',
        userId: 'u1',
      },
    ])

    const state = useProgressStore.getState()
    expect(state.items).toHaveLength(1)
    expect(state.items[0]?.completed).toBe(true)
  })
})
