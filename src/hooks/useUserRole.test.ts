import { renderHook } from '@testing-library/react'
import { describe, expect, it, beforeEach } from 'vitest'
import { useAuthStore } from '../store/authStore'
import { useUserRole } from './useUserRole'

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

describe('useUserRole', () => {
  it('returns null role and loading=true when store is not initialized', () => {
    useAuthStore.setState({ role: null, initialized: false })
    const { result } = renderHook(() => useUserRole())
    expect(result.current.role).toBeNull()
    expect(result.current.loading).toBe(true)
  })

  it('returns role and loading=false when store is initialized', () => {
    useAuthStore.setState({ role: 'learner', initialized: true })
    const { result } = renderHook(() => useUserRole())
    expect(result.current.role).toBe('learner')
    expect(result.current.loading).toBe(false)
  })

  it('returns educator role when set', () => {
    useAuthStore.setState({ role: 'educator', initialized: true })
    const { result } = renderHook(() => useUserRole())
    expect(result.current.role).toBe('educator')
    expect(result.current.loading).toBe(false)
  })

  it('returns null role for unauthenticated initialized state', () => {
    useAuthStore.setState({ role: null, initialized: true })
    const { result } = renderHook(() => useUserRole())
    expect(result.current.role).toBeNull()
    expect(result.current.loading).toBe(false)
  })
})
