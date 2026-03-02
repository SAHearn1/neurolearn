import { describe, expect, it } from 'vitest'
import { useAuthStore } from './authStore'

describe('useAuthStore', () => {
  it('sets authentication state and user id', () => {
    useAuthStore.setState({ isAuthenticated: false, userId: null })

    useAuthStore.getState().setUserId('user-123')
    useAuthStore.getState().setAuthenticated(true)

    const state = useAuthStore.getState()
    expect(state.userId).toBe('user-123')
    expect(state.isAuthenticated).toBe(true)
  })
})
