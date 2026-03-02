import { Link } from 'react-router-dom'

const courses = [
  { id: 'focus-fundamentals', level: 'Beginner', title: 'Focus Fundamentals' },
  { id: 'calm-study-systems', level: 'Intermediate', title: 'Calm Study Systems' },
  { id: 'communication-lab', level: 'Beginner', title: 'Communication Lab' },
]

export function CoursesPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Courses</h1>
        <p className="mt-2 text-slate-600">Explore neurodivergent-friendly learning tracks.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" key={course.id}>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{course.level}</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">{course.title}</h2>
            <Link className="mt-4 inline-block text-sm font-semibold text-brand-700" to={`/courses/${course.id}`}>
              Open course →
            </Link>
          </article>
        ))}
      </section>
    </main>
  )
}
