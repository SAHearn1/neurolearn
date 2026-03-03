import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { useCourses } from '../hooks/useCourses'
import { useEnrollment } from '../hooks/useEnrollment'

function EnrollButton({ courseId }: { courseId: string }) {
  const { isEnrolled, loading, enroll } = useEnrollment(courseId)
  const [enrolling, setEnrolling] = useState(false)

  if (loading) return null

  if (isEnrolled) {
    return (
      <Link
        className="mt-4 inline-block text-sm font-semibold text-brand-700"
        to={`/courses/${courseId}`}
      >
        Continue course &rarr;
      </Link>
    )
  }

  return (
    <Button
      variant="secondary"
      className="mt-4"
      disabled={enrolling}
      onClick={async () => {
        setEnrolling(true)
        try {
          await enroll()
        } finally {
          setEnrolling(false)
        }
      }}
    >
      {enrolling ? 'Enrolling…' : 'Enroll'}
    </Button>
  )
}

export function CoursesPage() {
  const { courses, loading, error } = useCourses()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-6"
    >
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Courses</h1>
        <p className="mt-2 text-slate-600">Explore neurodivergent-friendly learning tracks.</p>
      </header>

      {error && <Alert variant="error">{error}</Alert>}

      {!error && courses.length === 0 && (
        <p className="text-slate-500">No published courses available yet. Check back soon.</p>
      )}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <article
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            key={course.id}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              {course.level}
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">{course.title}</h2>
            {course.description && (
              <p className="mt-1 text-sm text-slate-500 line-clamp-2">{course.description}</p>
            )}
            <EnrollButton courseId={course.id} />
          </article>
        ))}
      </section>
    </main>
  )
}
