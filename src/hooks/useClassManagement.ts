import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useAuthStore } from '../store/authStore'
import type { ClassRecord, ClassEnrollment } from '../types/educator'

export function useClassManagement() {
  const user = useAuthStore((s) => s.user)
  const [classes, setClasses] = useState<ClassRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClasses = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('classes')
        .select('*')
        .eq('educator_id', user.id)
        .order('created_at', { ascending: false })

      if (err) throw err
      setClasses((data as ClassRecord[]) ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load classes')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchClasses()
  }, [fetchClasses])

  const createClass = useCallback(
    async (name: string, description?: string) => {
      if (!user?.id) return

      const { error: err } = await supabase
        .from('classes')
        .insert({ educator_id: user.id, name, description: description ?? null })

      if (err) throw err
      await fetchClasses()
    },
    [user?.id, fetchClasses],
  )

  const updateClass = useCallback(
    async (classId: string, updates: { name?: string; description?: string }) => {
      const { error: err } = await supabase
        .from('classes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', classId)

      if (err) throw err
      await fetchClasses()
    },
    [fetchClasses],
  )

  const deleteClass = useCallback(
    async (classId: string) => {
      const { error: err } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId)

      if (err) throw err
      await fetchClasses()
    },
    [fetchClasses],
  )

  const enrollStudent = useCallback(
    async (classId: string, studentId: string) => {
      const { error: err } = await supabase
        .from('class_enrollments')
        .insert({ class_id: classId, student_id: studentId })

      if (err) throw err
    },
    [],
  )

  const unenrollStudent = useCallback(
    async (classId: string, studentId: string) => {
      const { error: err } = await supabase
        .from('class_enrollments')
        .delete()
        .eq('class_id', classId)
        .eq('student_id', studentId)

      if (err) throw err
    },
    [],
  )

  const getClassEnrollments = useCallback(
    async (classId: string): Promise<ClassEnrollment[]> => {
      const { data, error: err } = await supabase
        .from('class_enrollments')
        .select('*')
        .eq('class_id', classId)

      if (err) throw err
      return (data as ClassEnrollment[]) ?? []
    },
    [],
  )

  return {
    classes,
    loading,
    error,
    createClass,
    updateClass,
    deleteClass,
    enrollStudent,
    unenrollStudent,
    getClassEnrollments,
    refetch: fetchClasses,
  }
}
