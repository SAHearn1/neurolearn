import { Link, useParams } from 'react-router-dom'

export function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Lesson</p>
        <h1 className="text-3xl font-bold text-slate-900">{lessonId ?? 'Current lesson'}</h1>
        <p className="text-slate-600">Course: {courseId}</p>
      </header>

      <article className="rounded-xl border border-slate-200 bg-white p-6 leading-relaxed text-slate-700 shadow-sm">
        This is a starter lesson container. Upcoming iterations can render text, audio, video, or
        interactive content from Supabase-backed lesson records.
      </article>

      <div>
        <Link className="text-sm font-semibold text-brand-700" to={`/courses/${courseId}`}>
          ← Back to course
        </Link>
      </div>
    </main>
  )
}
