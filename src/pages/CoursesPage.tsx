import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Alert } from '../components/ui/Alert'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { GradientThumbnail } from '../components/ui/GradientThumbnail'
import { Input } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import { useCourses } from '../hooks/useCourses'
import { useEnrollment } from '../hooks/useEnrollment'
import type { CourseLevel } from '../types/course'

function estimatedTime(lessonCount: number): string {
  const minutes = lessonCount * 20
  if (minutes < 60) return `~${minutes} min`
  const hours = Math.round(minutes / 60)
  return `~${hours} hr${hours !== 1 ? 's' : ''}`
}

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
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState<'all' | CourseLevel>('all')
  const [sort, setSort] = useState<'newest' | 'az' | 'shortest'>('newest')

  const filtered = useMemo(() => {
    let result = [...courses]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) => c.title.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q),
      )
    }
    if (difficulty !== 'all') result = result.filter((c) => c.level === difficulty)
    if (sort === 'az') result.sort((a, b) => a.title.localeCompare(b.title))
    else if (sort === 'shortest')
      result.sort((a, b) => (a.lesson_count ?? 0) - (b.lesson_count ?? 0))
    return result
  }, [courses, search, difficulty, sort])

  const clearFilters = () => {
    setSearch('')
    setDifficulty('all')
    setSort('newest')
  }

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

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="w-full sm:w-64">
          <Input
            label="Search courses"
            type="search"
            placeholder="Search courses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Difficulty pills */}
        <div role="group" aria-label="Filter by difficulty" className="flex flex-wrap gap-2">
          {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
                difficulty === d
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {d === 'all' ? 'All levels' : d}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'newest' | 'az' | 'shortest')}
          className="ml-auto rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
          aria-label="Sort courses"
        >
          <option value="newest">Newest</option>
          <option value="az">A–Z</option>
          <option value="shortest">Shortest first</option>
        </select>
      </div>

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
        {filtered.map((course) => (
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
              <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                <span>{course.lesson_count ?? 0} lessons</span>
                <span>·</span>
                <span>{estimatedTime(course.lesson_count ?? 0)}</span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-2">
                <EnrollButton courseId={course.id} />
              </div>
            </div>
          </article>
        ))}

        {filtered.length === 0 && !error && (
          <div className="col-span-full py-12 text-center">
            <p className="text-slate-500">No courses match your filter.</p>
            <button
              onClick={clearFilters}
              className="mt-2 text-sm font-semibold text-brand-700 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
