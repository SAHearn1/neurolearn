import { useMemo } from 'react'
import type { Course } from '../types'

const mockCourses: Course[] = [
  {
    description: 'Build practical strategies for staying focused with less overwhelm.',
    difficulty: 'beginner',
    id: 'focus-fundamentals',
    tags: ['focus', 'habits'],
    title: 'Focus Fundamentals',
  },
]

export function useCourses() {
  const courses = useMemo(() => mockCourses, [])
  return { courses, isLoading: false }
}
