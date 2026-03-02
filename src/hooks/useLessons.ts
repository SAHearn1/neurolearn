import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase/client'
import type { Lesson } from '../types/lesson'

export function useLessons(courseId: string | undefined) {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!courseId) {
      setLoading(false)
      return
    }

    setLoading(true)
    supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .eq('status', 'published')
      .order('sort_order', { ascending: true })
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setLessons((data ?? []) as Lesson[])
        setLoading(false)
      })
  }, [courseId])

  return { lessons, loading, error }
}

export function useLesson(lessonId: string | undefined) {
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!lessonId) {
      setLoading(false)
      return
    }

    setLoading(true)
    supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single()
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setLesson(data as Lesson)
        setLoading(false)
      })
  }, [lessonId])

  return { lesson, loading, error }
}
