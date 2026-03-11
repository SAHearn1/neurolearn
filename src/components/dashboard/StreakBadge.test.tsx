import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StreakBadge } from './StreakBadge'

describe('StreakBadge', () => {
  it('renders the streak day count', () => {
    render(<StreakBadge days={7} />)
    expect(screen.getByText(/7-day streak/i)).toBeInTheDocument()
  })

  it('renders with 1-day streak', () => {
    render(<StreakBadge days={1} />)
    expect(screen.getByText(/1-day streak/i)).toBeInTheDocument()
  })

  it('renders zero-day streak', () => {
    render(<StreakBadge days={0} />)
    expect(screen.getByText(/0-day streak/i)).toBeInTheDocument()
  })
})
