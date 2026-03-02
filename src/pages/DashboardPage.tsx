import { Link } from 'react-router-dom'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'

const activeCourses = [
  { id: 'focus-fundamentals', title: 'Focus Fundamentals', progress: 72 },
  { id: 'calm-study-systems', title: 'Calm Study Systems', progress: 45 },
]

export function DashboardPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 p-6">
      <header className="space-y-3">
        <Badge>Dashboard</Badge>
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
          <Card key={course.id}>
            <h2 className="text-lg font-semibold text-slate-900">{course.title}</h2>
            <ProgressBar label={`${course.progress}% complete`} value={course.progress} />
            <Link className="mt-4 inline-block text-sm font-semibold text-brand-700" to={`/courses/${course.id}`}>
              Continue course →
            </Link>
          </Card>
        ))}
      </section>

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

/* EpistemicDashboard widget placeholder — activated when Layer 4 flag is on.
   To integrate: import { EpistemicDashboard } from '../components/raca/EpistemicDashboard'
   and render inside a section gated by racaFlags.epistemicMonitoring */
