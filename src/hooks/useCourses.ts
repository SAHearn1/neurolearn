import { useEffect, useMemo, useState } from 'react'
import type { Course } from '../types'
import { getSupabaseClient } from '../../utils/supabase/client'

const mockCourses: Course[] = [
  {
    description: 'Build practical strategies for staying focused with less overwhelm.',
    difficulty: 'beginner',
    id: 'focus-fundamentals',
    tags: ['focus', 'habits'],
    title: 'Focus Fundamentals',
  },
]

interface CourseRecord {
  description: string
  difficulty: Course['difficulty']
  id: string
  tags: string[] | null
  title: string
}

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>(mockCourses)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      setIsLoading(false)
      return
    }

    let isMounted = true

    supabase
      .from('courses')
      .select('id,title,description,difficulty,tags')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!isMounted) {
          return
        }

        if (error || !data) {
          setCourses(mockCourses)
          setIsLoading(false)
          return
        }

        const mapped = (data as CourseRecord[]).map((course) => ({
          description: course.description,
          difficulty: course.difficulty,
          id: course.id,
          tags: course.tags ?? [],
          title: course.title,
        }))

        setCourses(mapped.length > 0 ? mapped : mockCourses)
        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return useMemo(() => ({ courses, isLoading }), [courses, isLoading])
}
