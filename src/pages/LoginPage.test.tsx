import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { useAuthStore } from '../store/authStore'
import { LoginPage } from './LoginPage'

// react-router-dom navigate mock
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  mockNavigate.mockReset()
  useAuthStore.setState({
    user: null,
    session: null,
    role: null,
    loading: false,
    initialized: true,
    roleLoading: false,
    pendingEmailConfirmation: false,
  })
})

describe('LoginPage', () => {
  it('renders heading and sign-in button', () => {
    renderLoginPage()
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders email and password inputs', () => {
    renderLoginPage()
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument()
  })

  it('renders forgot password and create account links', () => {
    renderLoginPage()
    expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /create account/i })).toBeInTheDocument()
  })

  it('shows validation error when submitting empty form', async () => {
    renderLoginPage()
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      // Expect at least one field error to appear
      const alerts = screen.getAllByRole('alert')
      expect(alerts.length).toBeGreaterThan(0)
    })
  })

  it('shows validation error for invalid email via form submit', async () => {
    renderLoginPage()
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: 'not-an-email' },
    })
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'password123' },
    })
    // Submit via the form element to bypass native HTML email validation in jsdom
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form')!)
    await waitFor(() => {
      const alerts = screen.getAllByRole('alert')
      expect(alerts.length).toBeGreaterThan(0)
    })
  })

  it('calls signIn and navigates to /dashboard on success', async () => {
    const mockSignIn = vi.fn().mockResolvedValue(undefined)
    useAuthStore.setState({ signIn: mockSignIn } as never)
    renderLoginPage()

    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: 'user@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'password123' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('user@example.com', 'password123')
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('shows error message when sign-in fails', async () => {
    const mockSignIn = vi.fn().mockRejectedValue(new Error('Invalid credentials'))
    useAuthStore.setState({ signIn: mockSignIn } as never)
    renderLoginPage()

    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: 'user@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
      target: { value: 'wrongpassword' },
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/invalid credentials/i)
    })
  })

  it('disables submit button when loading', () => {
    useAuthStore.setState({ loading: true })
    renderLoginPage()
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
  })
})
