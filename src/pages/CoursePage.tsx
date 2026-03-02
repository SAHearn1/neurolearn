import { Link, useParams } from 'react-router-dom'

const lessons = [
  { id: 'intro-routines', title: 'Intro to routines' },
  { id: 'sensory-breaks', title: 'Sensory break planning' },
  { id: 'reflection-checkpoint', title: 'Reflection checkpoint' },
]

export function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>()

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 p-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Course</p>
        <h1 className="text-3xl font-bold text-slate-900">{courseId ?? 'Selected course'}</h1>
      </header>

      <section className="space-y-3">
        {lessons.map((lesson, index) => (
          <article className="rounded-xl border border-slate-200 bg-white p-4" key={lesson.id}>
            <p className="text-sm text-slate-500">Lesson {index + 1}</p>
            <h2 className="text-lg font-semibold text-slate-900">{lesson.title}</h2>
            <Link className="mt-2 inline-block text-sm font-semibold text-brand-700" to={`/courses/${courseId}/lessons/${lesson.id}`}>
              Start lesson →
            </Link>
          </article>
        ))}
      </section>
    </main>
  )
}
