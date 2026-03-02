import { useMemo } from 'react'
import type { Lesson } from '../types'

const mockLessons: Lesson[] = [
  {
    contentBody: 'Use short reset routines to reduce cognitive overload.',
    contentType: 'text',
    courseId: 'focus-fundamentals',
    id: 'intro-routines',
    orderIndex: 1,
    title: 'Intro to routines',
  },
]

export function useLessons(courseId?: string) {
  const lessons = useMemo(() => mockLessons.filter((lesson) => !courseId || lesson.courseId === courseId), [courseId])
  return { isLoading: false, lessons }
}
