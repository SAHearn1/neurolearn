import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../components/ui/Avatar'
import { Alert } from '../components/ui/Alert'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Spinner } from '../components/ui/Spinner'
import { useAdaptiveLearning } from '../hooks/useAdaptiveLearning'
import { useCourses } from '../hooks/useCourses'
import { useProfile } from '../hooks/useProfile'
import { useProgressStore } from '../store/progressStore'
import { useAuthStore } from '../store/authStore'

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { profile, loading: profileLoading } = useProfile()
  const { courses, loading: coursesLoading, error: coursesError } = useCourses()
  const firstCourseId = courses[0]?.id
  const { state: adaptiveState, loading: adaptiveLoading } = useAdaptiveLearning(firstCourseId)
  const { courseProgress, fetchCourseProgress } = useProgressStore()

  const displayName = profile?.display_name ?? 'learner'

  // Fetch progress for all visible courses
  useEffect(() => {
    if (!user?.id || !courses.length) return
    courses.slice(0, 4).forEach((course) => {
      fetchCourseProgress(user.id, course.id)
    })
  }, [user?.id, courses, fetchCourseProgress])

  if (profileLoading || coursesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <main id="main-content" className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 p-6">
      <header className="space-y-3">
        <Badge>Dashboard</Badge>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome back, {displayName} 👋</h1>
            <p className="text-slate-600">Your progress overview and quick links for your next session.</p>
          </div>
          <Avatar name={displayName} />
        </div>
      </header>

      {coursesError && <Alert variant="error">{coursesError}</Alert>}

      {courses.length > 0 ? (
        <section aria-label="Active courses" className="grid gap-4 md:grid-cols-2">
          {courses.slice(0, 4).map((course) => (
            <Card key={course.id}>
              <h2 className="text-lg font-semibold text-slate-900">{course.title}</h2>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
                {course.level}
              </p>
              <ProgressBar
                label={`${courseProgress[course.id]?.percent_complete ?? 0}% complete`}
                value={courseProgress[course.id]?.percent_complete ?? 0}
              />
              <Link
                className="mt-4 inline-block text-sm font-semibold text-brand-700"
                to={`/courses/${course.id}`}
              >
                Continue course →
              </Link>
            </Card>
          ))}
        </section>
      ) : (
        <section>
          <p className="text-sm text-slate-500">
            No courses available yet.{' '}
            <Link className="font-semibold text-brand-700" to="/courses">
              Browse the catalog →
            </Link>
          </p>
        </section>
      )}

      <section aria-label="Recommended next lesson">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Recommended for You</h2>
        {adaptiveLoading ? (
          <Spinner />
        ) : adaptiveState?.recommended_lesson_id ? (
          <Card>
            <p className="text-sm text-slate-600">
              Based on your performance (mastery:{' '}
              <strong>{adaptiveState.mastery_score}%</strong>), we recommend continuing at{' '}
              <strong>{adaptiveState.current_difficulty}</strong> difficulty.
            </p>
            <Link
              className="mt-2 inline-block text-sm font-semibold text-brand-700"
              to="/courses"
            >
              View recommendations →
            </Link>
          </Card>
        ) : (
          <p className="text-sm text-slate-500">
            Complete a lesson to get personalized recommendations.
          </p>
        )}
      </section>

      <nav aria-label="Quick links" className="flex flex-wrap gap-3">
        <Link to="/courses">
          <Button variant="secondary">Browse courses</Button>
        </Link>
        <Link to="/profile">
          <Button variant="secondary">View profile</Button>
        </Link>
        <Link to="/settings">
          <Button variant="secondary">Update settings</Button>
        </Link>
      </nav>
    </main>
  )
}

/* EpistemicDashboard widget placeholder — activated when Layer 4 flag is on.
   To integrate: import { EpistemicDashboard } from '../components/raca/EpistemicDashboard'
   and render inside a section gated by racaFlags.epistemicMonitoring */
