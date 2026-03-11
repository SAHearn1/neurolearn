import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RecentActivity } from './RecentActivity'

describe('RecentActivity', () => {
  it('renders all provided activity items', () => {
    const items = ['Completed Lesson 1', 'Started Course A', 'Earned badge']
    render(<RecentActivity items={items} />)
    for (const item of items) {
      expect(screen.getByText(item)).toBeInTheDocument()
    }
  })

  it('renders empty list when no items provided', () => {
    render(<RecentActivity items={[]} />)
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
  })

  it('shows heading', () => {
    render(<RecentActivity items={[]} />)
    expect(screen.getByText('Recent activity')).toBeInTheDocument()
  })
})
