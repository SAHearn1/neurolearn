import { renderHook } from '@testing-library/react'
import { describe, expect, it, beforeEach } from 'vitest'
import { useAuthStore } from '../store/authStore'
import { useAuth } from './useAuth'

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    session: null,
    role: null,
    loading: false,
    initialized: false,
    roleLoading: false,
    pendingEmailConfirmation: false,
  })
})

describe('useAuth', () => {
  it('returns isAuthenticated=false when no session exists', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('returns isAuthenticated=true when session is present', () => {
    useAuthStore.setState({ session: { access_token: 'token' } as never })
    const { result } = renderHook(() => useAuth())
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('exposes user, session, loading, and initialized from the store', () => {
    useAuthStore.setState({
      user: { id: 'user-1', email: 'test@example.com' } as never,
      session: { access_token: 'token' } as never,
      loading: false,
      initialized: true,
    })
    const { result } = renderHook(() => useAuth())
    expect(result.current.user?.id).toBe('user-1')
    expect(result.current.loading).toBe(false)
    expect(result.current.initialized).toBe(true)
  })

  it('exposes signIn, signUp, and signOut as functions', () => {
    const { result } = renderHook(() => useAuth())
    expect(typeof result.current.signIn).toBe('function')
    expect(typeof result.current.signUp).toBe('function')
    expect(typeof result.current.signOut).toBe('function')
  })
})
