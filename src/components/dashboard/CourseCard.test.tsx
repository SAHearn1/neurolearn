import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { CourseCard } from './CourseCard'

function renderCourseCard(props?: Partial<Parameters<typeof CourseCard>[0]>) {
  const defaults = {
    id: 'course-1',
    title: 'Introduction to Algebra',
    level: 'beginner' as const,
    completedLessons: 3,
    totalLessons: 10,
  }
  return render(
    <MemoryRouter>
      <CourseCard {...defaults} {...props} />
    </MemoryRouter>,
  )
}

describe('CourseCard', () => {
  it('renders the course title', () => {
    renderCourseCard()
    expect(screen.getByText('Introduction to Algebra')).toBeInTheDocument()
  })

  it('renders the course level badge', () => {
    renderCourseCard({ level: 'intermediate' })
    expect(screen.getByText('intermediate')).toBeInTheDocument()
  })

  it('renders a link to the course', () => {
    renderCourseCard({ id: 'abc123' })
    expect(screen.getByRole('link', { name: /continue course/i })).toHaveAttribute(
      'href',
      '/courses/abc123',
    )
  })

  it('shows 0/10 progress label when no lessons completed', () => {
    renderCourseCard({ completedLessons: 0, totalLessons: 10 })
    expect(screen.getByText('0/10 lessons complete')).toBeInTheDocument()
  })

  it('shows correct progress label', () => {
    renderCourseCard({ completedLessons: 5, totalLessons: 10 })
    expect(screen.getByText('5/10 lessons complete')).toBeInTheDocument()
  })

  it('handles zero total lessons without throwing', () => {
    renderCourseCard({ completedLessons: 0, totalLessons: 0 })
    expect(screen.getByText('0/0 lessons complete')).toBeInTheDocument()
  })
})
