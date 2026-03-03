import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../utils/supabase/client'
import type { Course } from '../types/course'

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (err) throw err
      setCourses((data ?? []) as Course[])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load courses')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  return { courses, loading, error, refetch: fetchCourses }
}

export function useCourse(courseId: string | undefined) {
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!courseId) {
      setLoading(false)
      return
    }

    setLoading(true)
    void (async () => {
      try {
        const { data, error: err } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single()
        if (err) setError(err.message)
        else setCourse(data as Course)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load course')
      } finally {
        setLoading(false)
      }
    })()
  }, [courseId])

  return { course, loading, error }
}
