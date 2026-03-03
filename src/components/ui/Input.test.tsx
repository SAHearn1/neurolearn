import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Input } from './Input'

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('fires onChange when typed into', () => {
    const handler = vi.fn()
    render(<Input label="Name" onChange={handler} />)
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'test' } })
    expect(handler).toHaveBeenCalled()
  })

  it('shows error message with aria-describedby', () => {
    render(<Input label="Email" error="Invalid email" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email')
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'email-error')
  })

  it('does not show error when no error prop', () => {
    render(<Input label="Email" />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
