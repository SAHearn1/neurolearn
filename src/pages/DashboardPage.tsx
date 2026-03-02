import { Link } from 'react-router-dom'
import { CourseCard } from '../components/dashboard/CourseCard'
import { RecentActivity } from '../components/dashboard/RecentActivity'
import { StreakBadge } from '../components/dashboard/StreakBadge'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'

const activeCourses = [
  { completedLessons: 8, id: 'focus-fundamentals', title: 'Focus Fundamentals', totalLessons: 11 },
  { completedLessons: 5, id: 'calm-study-systems', title: 'Calm Study Systems', totalLessons: 11 },
]

export function DashboardPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 p-6">
      <header className="space-y-3">
        <StreakBadge days={8} />
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome back, learner 👋</h1>
            <p className="text-slate-600">Your progress overview and quick links for your next session.</p>
          </div>
          <Avatar name="Ada Learner" />
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {activeCourses.map((course) => (
          <CourseCard key={course.id} {...course} />
        ))}
      </section>

      <RecentActivity items={['Completed “Sensory break planning”', 'Logged in for 8 consecutive days', 'Started “Calm Study Systems”']} />

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
