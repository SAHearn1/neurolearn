import { useEffect, useMemo, useState } from 'react'
import type { Lesson } from '../types'
import { getSupabaseClient } from '../../utils/supabase/client'

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

interface LessonRecord {
  content_body: string | null
  content_type: Lesson['contentType']
  content_url: string | null
  course_id: string
  id: string
  order_index: number
  title: string
}

export function useLessons(courseId?: string) {
  const [lessons, setLessons] = useState<Lesson[]>(
    mockLessons.filter((lesson) => !courseId || lesson.courseId === courseId),
  )
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      setIsLoading(false)
      return
    }

    let isMounted = true

    let query = supabase
      .from('lessons')
      .select('id,course_id,title,content_type,content_url,content_body,order_index')
      .order('order_index', { ascending: true })

    if (courseId) {
      query = query.eq('course_id', courseId)
    }

    query.then(({ data, error }) => {
      if (!isMounted) {
        return
      }

      if (error || !data) {
        setLessons(mockLessons.filter((lesson) => !courseId || lesson.courseId === courseId))
        setIsLoading(false)
        return
      }

      const mapped = (data as LessonRecord[]).map((lesson) => ({
        contentBody: lesson.content_body ?? undefined,
        contentType: lesson.content_type,
        contentUrl: lesson.content_url ?? undefined,
        courseId: lesson.course_id,
        id: lesson.id,
        orderIndex: lesson.order_index,
        title: lesson.title,
      }))

      const fallback = mockLessons.filter((lesson) => !courseId || lesson.courseId === courseId)
      setLessons(mapped.length > 0 ? mapped : fallback)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [courseId])

  return useMemo(() => ({ isLoading, lessons }), [isLoading, lessons])
}
