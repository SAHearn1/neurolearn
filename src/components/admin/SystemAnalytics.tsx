import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../../utils/supabase/client'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'
import { Spinner } from '../ui/Spinner'

interface SystemStats {
  totalUsers: number
  usersByRole: Record<string, number>
  totalCourses: number
  publishedCourses: number
  totalLessons: number
  totalCompletedLessons: number
  totalClasses: number
  totalEnrollments: number
}

export function SystemAnalytics() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch counts in parallel
      const [profilesRes, coursesRes, lessonsRes, progressRes, classesRes, enrollmentsRes] =
        await Promise.all([
          supabase.from('profiles').select('role'),
          supabase.from('courses').select('status'),
          supabase.from('lessons').select('id', { count: 'exact', head: true }),
          supabase.from('lesson_progress').select('status'),
          supabase.from('classes').select('id', { count: 'exact', head: true }),
          supabase.from('class_enrollments').select('id', { count: 'exact', head: true }),
        ])

      const profiles = profilesRes.data ?? []
      const courses = coursesRes.data ?? []
      const progress = progressRes.data ?? []

      const roleCount: Record<string, number> = {}
      for (const p of profiles) {
        roleCount[p.role] = (roleCount[p.role] ?? 0) + 1
      }

      setStats({
        totalUsers: profiles.length,
        usersByRole: roleCount,
        totalCourses: courses.length,
        publishedCourses: courses.filter((c) => c.status === 'published').length,
        totalLessons: lessonsRes.count ?? 0,
        totalCompletedLessons: progress.filter((p) => p.status === 'completed').length,
        totalClasses: classesRes.count ?? 0,
        totalEnrollments: enrollmentsRes.count ?? 0,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const exportCSV = useCallback(() => {
    if (!stats) return
    const rows = [
      ['Metric', 'Value'],
      ['Total Users', stats.totalUsers],
      ...Object.entries(stats.usersByRole).map(([role, count]) => [`Users (${role})`, count]),
      ['Total Courses', stats.totalCourses],
      ['Published Courses', stats.publishedCourses],
      ['Total Lessons', stats.totalLessons],
      ['Completed Lesson Progress', stats.totalCompletedLessons],
      ['Total Classes', stats.totalClasses],
      ['Total Enrollments', stats.totalEnrollments],
    ]

    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `system-analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [stats])

  if (loading) return <Spinner />
  if (error) return <Alert variant="error">{error}</Alert>
  if (!stats) return null

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">System Analytics</h2>
        <Button variant="secondary" onClick={exportCSV}>
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-sm font-medium text-slate-500">Total Users</p>
          <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-500">Courses (Published)</p>
          <p className="text-2xl font-bold text-slate-900">
            {stats.publishedCourses}/{stats.totalCourses}
          </p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-500">Total Lessons</p>
          <p className="text-2xl font-bold text-slate-900">{stats.totalLessons}</p>
        </Card>
        <Card>
          <p className="text-sm font-medium text-slate-500">Classes</p>
          <p className="text-2xl font-bold text-slate-900">{stats.totalClasses}</p>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-slate-900 mb-2">Users by Role</h3>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(stats.usersByRole).map(([role, count]) => (
            <div key={role}>
              <p className="text-sm text-slate-500 capitalize">{role}</p>
              <p className="text-xl font-bold text-slate-900">{count}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-900 mb-2">Learning Activity</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500">Completed Lessons</p>
            <p className="text-xl font-bold text-slate-900">{stats.totalCompletedLessons}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Active Enrollments</p>
            <p className="text-xl font-bold text-slate-900">{stats.totalEnrollments}</p>
          </div>
        </div>
      </Card>
    </section>
  )
}
