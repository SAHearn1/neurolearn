import { Link } from 'react-router-dom'
import { CourseCard } from '../components/dashboard/CourseCard'
import { RecentActivity } from '../components/dashboard/RecentActivity'
import { StreakBadge } from '../components/dashboard/StreakBadge'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { useCourses } from '../hooks/useCourses'
import { useProgress } from '../hooks/useProgress'
import { useProfile } from '../hooks/useProfile'

export function DashboardPage() {
  const { userId } = useAuth()
  const { courses } = useCourses()
  const { completedCount } = useProgress(userId ?? 'demo-user')
  const { profile } = useProfile()

  const activeCourses = courses.map((course) => ({
    completedLessons: Math.min(completedCount, 5),
    id: course.id,
    title: course.title,
    totalLessons: 11,
  }))

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 p-6">
      <header className="space-y-3">
        <StreakBadge days={Math.max(1, completedCount)} />
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome back, {profile.displayName} 👋</h1>
            <p className="text-slate-600">Your progress overview and quick links for your next session.</p>
          </div>
          <Avatar name={profile.displayName} src={profile.avatarUrl} />
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {activeCourses.map((course) => (
          <CourseCard key={course.id} {...course} />
        ))}
      </section>

      <RecentActivity
        items={[
          `Completed lessons: ${completedCount}`,
          `Learning style: ${profile.learningStyle}`,
          'Synced course data from current provider',
        ]}
      />

      <nav className="flex flex-wrap gap-3">
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
