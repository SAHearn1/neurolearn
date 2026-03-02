import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useAuthStore } from '../store/authStore'
import type { ParentStudentLink, LinkedStudent } from '../types/parent'

export function useParentStudentLinks() {
  const user = useAuthStore((s) => s.user)
  const [links, setLinks] = useState<LinkedStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLinks = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('parent_student_links')
        .select(`
          id, parent_id, student_id, status, created_at,
          student:profiles!parent_student_links_student_id_fkey (
            user_id, display_name, avatar_url, streak_days, lessons_completed
          )
        `)
        .eq('parent_id', user.id)
        .order('created_at', { ascending: false })

      if (err) throw err

      const linked: LinkedStudent[] = ((data as Record<string, unknown>[]) ?? []).map((row) => ({
        link: {
          id: row.id as string,
          parent_id: row.parent_id as string,
          student_id: row.student_id as string,
          status: row.status as ParentStudentLink['status'],
          created_at: row.created_at as string,
        },
        student: row.student as LinkedStudent['student'],
      }))

      setLinks(linked)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load linked students')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchLinks()
  }, [fetchLinks])

  const linkStudent = useCallback(
    async (studentId: string) => {
      if (!user?.id) return

      const { error: err } = await supabase
        .from('parent_student_links')
        .insert({ parent_id: user.id, student_id: studentId, status: 'pending' })

      if (err) throw err
      await fetchLinks()
    },
    [user?.id, fetchLinks],
  )

  const updateLinkStatus = useCallback(
    async (linkId: string, status: 'active' | 'approved' | 'revoked' | 'rejected') => {
      const { error: err } = await supabase
        .from('parent_student_links')
        .update({ status })
        .eq('id', linkId)

      if (err) throw err
      await fetchLinks()
    },
    [fetchLinks],
  )

  const unlinkStudent = useCallback(
    async (linkId: string) => {
      const { error: err } = await supabase
        .from('parent_student_links')
        .delete()
        .eq('id', linkId)

      if (err) throw err
      await fetchLinks()
    },
    [fetchLinks],
  )

  return {
    links,
    activeLinks: links.filter((l) => l.link.status === 'active'),
    pendingLinks: links.filter((l) => l.link.status === 'pending'),
    loading,
    error,
    linkStudent,
    updateLinkStatus,
    unlinkStudent,
    refetch: fetchLinks,
  }
}
