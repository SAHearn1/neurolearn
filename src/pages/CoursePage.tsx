import { Link, useParams } from 'react-router-dom'
import { Alert } from '../components/ui/Alert'
import { Spinner } from '../components/ui/Spinner'
import { useCourse } from '../hooks/useCourses'
import { useLessons } from '../hooks/useLessons'

export function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>()
  const { course, loading: courseLoading, error: courseError } = useCourse(courseId)
  const { lessons, loading: lessonsLoading, error: lessonsError } = useLessons(courseId)

  if (courseLoading || lessonsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <main id="main-content" className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 p-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Course</p>
        <h1 className="text-3xl font-bold text-slate-900">{course?.title ?? 'Course'}</h1>
        {course?.description && (
          <p className="mt-2 text-slate-600">{course.description}</p>
        )}
      </header>

      {(courseError || lessonsError) && (
        <Alert variant="error">{courseError ?? lessonsError}</Alert>
      )}

      {lessons.length === 0 && !lessonsError && (
        <p className="text-slate-500">No lessons available yet for this course.</p>
      )}

      <section className="space-y-3">
        {lessons.map((lesson, index) => (
          <article className="rounded-xl border border-slate-200 bg-white p-4" key={lesson.id}>
            <p className="text-sm text-slate-500">Lesson {index + 1}</p>
            <h2 className="text-lg font-semibold text-slate-900">{lesson.title}</h2>
            {lesson.description && (
              <p className="mt-1 text-sm text-slate-500">{lesson.description}</p>
            )}
            <Link
              className="mt-2 inline-block text-sm font-semibold text-brand-700"
              to={`/courses/${courseId}/lessons/${lesson.id}`}
            >
              Start lesson →
            </Link>
          </article>
        ))}
      </section>

      <div>
        <Link className="text-sm font-semibold text-brand-700" to="/courses">
          &larr; Back to courses
        </Link>
      </div>
    </main>
  )
}
