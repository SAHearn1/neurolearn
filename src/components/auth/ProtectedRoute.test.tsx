import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { ProtectedRoute } from './ProtectedRoute'

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

beforeEach(() => {
  mockNavigate.mockReset()
})

describe('ProtectedRoute', () => {
  it('shows spinner when not initialized', () => {
    useAuthStore.setState({ initialized: false, loading: true, session: null })
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <p>Protected</p>
        </ProtectedRoute>
      </MemoryRouter>,
    )
    expect(screen.queryByText('Protected')).not.toBeInTheDocument()
  })

  it('renders children when authenticated', () => {
    useAuthStore.setState({
      initialized: true,
      loading: false,
      session: { access_token: 'token' } as never,
      user: { id: 'u1' } as never,
      role: 'learner',
    })
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <p>Protected content</p>
        </ProtectedRoute>
      </MemoryRouter>,
    )
    expect(screen.getByText('Protected content')).toBeInTheDocument()
  })

  it('redirects to /login when no session', () => {
    useAuthStore.setState({ initialized: true, loading: false, session: null, user: null })
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <p>Protected</p>
        </ProtectedRoute>
      </MemoryRouter>,
    )
    expect(mockNavigate).toHaveBeenCalledWith('/login', expect.objectContaining({ replace: true }))
  })

  it('redirects to /dashboard when role is not allowed', () => {
    useAuthStore.setState({
      initialized: true,
      loading: false,
      session: { access_token: 'token' } as never,
      user: { id: 'u1' } as never,
      role: 'learner',
    })
    render(
      <MemoryRouter>
        <ProtectedRoute requiredRole="admin">
          <p>Admin content</p>
        </ProtectedRoute>
      </MemoryRouter>,
    )

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
    expect(screen.queryByText('Admin content')).not.toBeInTheDocument()
  })

  it('renders children when role is allowed', () => {
    useAuthStore.setState({
      initialized: true,
      loading: false,
      session: { access_token: 'token' } as never,
      user: { id: 'u1' } as never,
      role: 'admin',
    })
    render(
      <MemoryRouter>
        <ProtectedRoute requiredRole={['admin', 'educator']}>
          <p>Privileged content</p>
        </ProtectedRoute>
      </MemoryRouter>,
    )

    expect(screen.getByText('Privileged content')).toBeInTheDocument()
  })
})
