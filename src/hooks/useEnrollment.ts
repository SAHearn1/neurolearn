import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useAuthStore } from '../store/authStore'
import type { Course } from '../types/course'

interface Enrollment {
  id: string
  user_id: string
  course_id: string
  enrolled_at: string
  completed_at: string | null
}

export function useEnrolledCourses() {
  const user = useAuthStore((s) => s.user)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('course_enrollments')
        .select('course_id, courses(*)')
        .eq('user_id', user.id)

      if (err) throw err

      const enrolled = (data ?? [])
        .map((row: Record<string, unknown>) => row.courses as Course)
        .filter(Boolean)

      setCourses(enrolled)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load enrolled courses')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { courses, loading, error, refetch: fetch }
}

export function useEnrollment(courseId: string | undefined) {
  const user = useAuthStore((s) => s.user)
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id || !courseId) {
      setLoading(false)
      return
    }

    supabase
      .from('course_enrollments')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .maybeSingle()
      .then(({ data }) => {
        setEnrollment(data as Enrollment | null)
        setLoading(false)
      })
  }, [user?.id, courseId])

  const enroll = useCallback(async () => {
    if (!user?.id || !courseId) return
    const { data, error } = await supabase
      .from('course_enrollments')
      .insert({ user_id: user.id, course_id: courseId })
      .select()
      .single()

    if (error) throw error
    setEnrollment(data as Enrollment)
  }, [user?.id, courseId])

  const isEnrolled = enrollment !== null

  return { enrollment, isEnrolled, loading, enroll }
}
