import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, beforeEach } from 'vitest'
import { useAuthStore } from '../store/authStore'
import { useRuntimeStore } from '../lib/raca/layer0-runtime/runtime-store'
import { useRacaSession } from './useRacaSession'

beforeEach(() => {
  useAuthStore.setState({
    user: null,
    session: null,
    role: null,
    loading: false,
    initialized: true,
    roleLoading: false,
    pendingEmailConfirmation: false,
  })
  // Reset runtime store to initial state
  useRuntimeStore.setState({
    session_id: null,
    user_id: null,
    lesson_id: null,
    course_id: null,
    status: null,
    current_state: 'ROOT',
    state_history: [],
    regulation: {
      level: 50,
      signals: [],
      intervention_active: false,
      intervention_count: 0,
      last_check: '',
    },
    artifacts: [],
    events: [],
  })
})

describe('useRacaSession', () => {
  it('returns idle status and isActive=false initially', () => {
    const { result } = renderHook(() => useRacaSession())
    expect(result.current.status).toBeNull()
    expect(result.current.isActive).toBe(false)
  })

  it('exposes required fields and functions', () => {
    const { result } = renderHook(() => useRacaSession())
    expect('sessionId' in result.current).toBe(true)
    expect('status' in result.current).toBe(true)
    expect('currentState' in result.current).toBe(true)
    expect('stateHistory' in result.current).toBe(true)
    expect('regulation' in result.current).toBe(true)
    expect('artifacts' in result.current).toBe(true)
    expect('events' in result.current).toBe(true)
    expect(typeof result.current.start).toBe('function')
    expect(typeof result.current.end).toBe('function')
    expect(typeof result.current.save).toBe('function')
  })

  it('start returns null when no user is authenticated', async () => {
    const { result } = renderHook(() => useRacaSession())
    let sessionId: string | null = undefined as never
    await act(async () => {
      sessionId = await result.current.start({ lesson_id: 'lesson-1', course_id: 'course-1' })
    })
    expect(sessionId).toBeNull()
  })

  it('isActive is true when runtime store status is active', () => {
    useRuntimeStore.setState({ status: 'active' })
    const { result } = renderHook(() => useRacaSession())
    expect(result.current.isActive).toBe(true)
  })

  it('reflects sessionId from runtime store', () => {
    useRuntimeStore.setState({ session_id: 'sess-abc' })
    const { result } = renderHook(() => useRacaSession())
    expect(result.current.sessionId).toBe('sess-abc')
  })
})
