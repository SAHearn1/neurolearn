import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProgressWidget } from './ProgressWidget'

describe('ProgressWidget', () => {
  it('shows correct lesson label', () => {
    render(<ProgressWidget complete={3} total={10} />)
    expect(screen.getByText('3/10 lessons complete')).toBeInTheDocument()
  })

  it('shows 0/0 lessons complete when both are zero', () => {
    render(<ProgressWidget complete={0} total={0} />)
    expect(screen.getByText('0/0 lessons complete')).toBeInTheDocument()
  })

  it('shows full completion label', () => {
    render(<ProgressWidget complete={5} total={5} />)
    expect(screen.getByText('5/5 lessons complete')).toBeInTheDocument()
  })
})
