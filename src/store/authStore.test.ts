import { describe, expect, it, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'

// Reset store between tests
beforeEach(() => {
  useAuthStore.setState({
    user: null,
    session: null,
    role: null,
    loading: false,
    initialized: false,
  })
})

describe('useAuthStore', () => {
  it('starts with no user and not initialized', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.session).toBeNull()
    expect(state.role).toBeNull()
    expect(state.loading).toBe(false)
    expect(state.initialized).toBe(false)
  })

  it('signIn sets loading during request', async () => {
    const { signIn } = useAuthStore.getState()
    const promise = signIn('test@example.com', 'password123')
    // loading should be true while in-flight
    expect(useAuthStore.getState().loading).toBe(true)
    await promise
    expect(useAuthStore.getState().loading).toBe(false)
  })

  it('signOut clears user, session, and role', async () => {
    // Manually set state as if logged in
    useAuthStore.setState({
      user: { id: 'user-1' } as never,
      session: { access_token: 'token' } as never,
      role: 'learner',
    })
    await useAuthStore.getState().signOut()
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.session).toBeNull()
    expect(state.role).toBeNull()
  })

  it('initialize returns an unsubscribe function', () => {
    const unsubscribe = useAuthStore.getState().initialize()
    expect(typeof unsubscribe).toBe('function')
    unsubscribe()
  })

  it('signUp sets loading during request', async () => {
    const { signUp } = useAuthStore.getState()
    const promise = signUp('new@example.com', 'password123', 'Test User')
    expect(useAuthStore.getState().loading).toBe(true)
    await promise
    expect(useAuthStore.getState().loading).toBe(false)
  })
})
