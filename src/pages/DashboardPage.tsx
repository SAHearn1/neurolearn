import { Link } from 'react-router-dom'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Spinner } from '../components/ui/Spinner'
import { useAdaptiveLearning } from '../hooks/useAdaptiveLearning'

const activeCourses = [
  { id: 'focus-fundamentals', title: 'Focus Fundamentals', progress: 72 },
  { id: 'calm-study-systems', title: 'Calm Study Systems', progress: 45 },
]

export function DashboardPage() {
  const { state: adaptiveState, loading: adaptiveLoading } = useAdaptiveLearning(activeCourses[0]?.id)

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

      <section aria-label="Recommended next lesson">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Recommended for You</h2>
        {adaptiveLoading ? (
          <Spinner />
        ) : adaptiveState?.recommended_lesson_id ? (
          <Card>
            <p className="text-sm text-slate-600">Based on your performance (mastery: {adaptiveState.mastery_score}%), we recommend continuing at <strong>{adaptiveState.current_difficulty}</strong> difficulty.</p>
            <Link className="mt-2 inline-block text-sm font-semibold text-brand-700" to="/courses">
              View recommendations →
            </Link>
          </Card>
        ) : (
          <p className="text-sm text-slate-500">Complete a lesson to get personalized recommendations.</p>
        )}
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
