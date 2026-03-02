import { Link, useParams } from 'react-router-dom'
import { useCourses } from '../hooks/useCourses'
import { useLessons } from '../hooks/useLessons'

export function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { courses } = useCourses()
  const { isLoading, lessons } = useLessons(courseId)

  const course = courses.find((entry) => entry.id === courseId)

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 p-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Course</p>
        <h1 className="text-3xl font-bold text-slate-900">{course?.title ?? courseId ?? 'Selected course'}</h1>
        {course?.description ? <p className="mt-1 text-slate-600">{course.description}</p> : null}
      </header>

      {isLoading ? <p className="text-sm text-slate-500">Loading lessons…</p> : null}

      <section className="space-y-3">
        {lessons.map((lesson, index) => (
          <article className="rounded-xl border border-slate-200 bg-white p-4" key={lesson.id}>
            <p className="text-sm text-slate-500">Lesson {index + 1}</p>
            <h2 className="text-lg font-semibold text-slate-900">{lesson.title}</h2>
            <Link
              className="mt-2 inline-block text-sm font-semibold text-brand-700"
              to={`/courses/${courseId}/lessons/${lesson.id}`}
            >
              Start lesson →
            </Link>
          </article>
        ))}
      </section>
    </main>
  )
}
