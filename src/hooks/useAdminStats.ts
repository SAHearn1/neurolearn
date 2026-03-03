import { useState, useEffect } from 'react'
import { supabase } from '../../utils/supabase/client'

interface PlatformStats {
  totalUsers: number
  activeLearners: number
  totalCourses: number
  lessonsCompleted: number
}

export function useAdminStats() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      setError(null)
      try {
        const [usersRes, activeLearnerRes, coursesRes, completedRes] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('lesson_progress').select('user_id', { count: 'exact', head: true }),
          supabase.from('courses').select('*', { count: 'exact', head: true }),
          supabase
            .from('lesson_progress')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'completed'),
        ])
        if (usersRes.error) throw usersRes.error
        setStats({
          totalUsers: usersRes.count ?? 0,
          activeLearners: activeLearnerRes.count ?? 0,
          totalCourses: coursesRes.count ?? 0,
          lessonsCompleted: completedRes.count ?? 0,
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load stats')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return { stats, loading, error }
}
