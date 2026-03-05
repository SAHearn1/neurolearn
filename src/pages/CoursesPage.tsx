import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert } from '../components/ui/Alert'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { GradientThumbnail } from '../components/ui/GradientThumbnail'
import { Spinner } from '../components/ui/Spinner'
import { useCourses } from '../hooks/useCourses'
import { useEnrollment } from '../hooks/useEnrollment'
import type { CourseLevel } from '../types/course'

function EnrollButton({ courseId }: { courseId: string }) {
  const { isEnrolled, loading, enroll } = useEnrollment(courseId)
  const [enrolling, setEnrolling] = useState(false)

  if (loading) return null

  if (isEnrolled) {
    return (
      <Link
        className="inline-block text-sm font-semibold text-brand-700"
        to={`/courses/${courseId}`}
      >
        In progress →
      </Link>
    )
  }

  return (
    <Button
      variant="secondary"
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
    <main id="main-content" className="mx-auto w-full max-w-5xl flex flex-col gap-6 p-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Courses</h1>
        <p className="mt-1 text-slate-500">
          Explore neurodivergent-friendly learning tracks designed to meet you where you are.
        </p>
      </header>

      {error && <Alert variant="error">{error}</Alert>}

      {!error && courses.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <p className="text-4xl">🌱</p>
          <p className="mt-3 text-lg font-semibold text-slate-700">No courses available yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Check back soon — new content is on the way.
          </p>
          <Link to="/dashboard">
            <Button className="mt-4" variant="secondary">
              Back to dashboard
            </Button>
          </Link>
        </div>
      )}

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <article
            className="card-hover flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            key={course.id}
          >
            <div className="relative">
              <GradientThumbnail level={course.level as CourseLevel} />
              <span className="absolute bottom-2 right-2">
                <Badge>{course.level}</Badge>
              </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h2 className="text-lg font-semibold text-slate-900">{course.title}</h2>
              {course.description && (
                <p className="mt-1 flex-1 text-sm text-slate-500 line-clamp-2">
                  {course.description}
                </p>
              )}
              <div className="mt-4 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-400">
                  {course.lesson_count ?? 0} lesson{course.lesson_count !== 1 ? 's' : ''}
                </span>
                <EnrollButton courseId={course.id} />
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
