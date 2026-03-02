import { describe, expect, it } from 'vitest'
import { useAuthStore } from './authStore'

describe('useAuthStore', () => {
  it('starts with no user and not initialized', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.session).toBeNull()
    expect(state.loading).toBe(false)
    expect(state.initialized).toBe(false)
  })
})
