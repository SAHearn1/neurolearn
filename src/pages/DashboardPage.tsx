import { Link } from 'react-router-dom'

const activeCourses = [
  { id: 'focus-fundamentals', title: 'Focus Fundamentals', progress: 72 },
  { id: 'calm-study-systems', title: 'Calm Study Systems', progress: 45 },
]

export function DashboardPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 p-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Dashboard</p>
        <h1 className="text-3xl font-bold text-slate-900">Welcome back, learner 👋</h1>
        <p className="text-slate-600">Your progress overview and quick links for your next session.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {activeCourses.map((course) => (
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" key={course.id}>
            <h2 className="text-lg font-semibold text-slate-900">{course.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{course.progress}% complete</p>
            <div className="mt-3 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-brand-500"
                style={{ width: `${course.progress}%` }}
              />
            </div>
            <Link className="mt-4 inline-block text-sm font-semibold text-brand-700" to={`/courses/${course.id}`}>
              Continue course →
            </Link>
          </article>
        ))}
      </section>

      <nav className="flex flex-wrap gap-3">
        <Link className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700" to="/courses">
          Browse courses
        </Link>
        <Link className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700" to="/profile">
          View profile
        </Link>
        <Link className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700" to="/settings">
          Update settings
        </Link>
      </nav>
    </main>
  )
}
