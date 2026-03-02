import { Link, useParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { racaFlags } from '../lib/raca/feature-flags'

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

      {racaFlags.runtime && (
        <div className="rounded-lg border border-brand-200 bg-brand-50 p-4">
          <p className="mb-2 text-sm text-brand-800">
            Ready to engage deeply with this lesson? Start an AI-guided cognitive session.
          </p>
          <Link to={`/courses/${courseId}/lessons/${lessonId}/session`}>
            <Button>Start RACA Session</Button>
          </Link>
        </div>
      )}

      <div>
        <Link className="text-sm font-semibold text-brand-700" to={`/courses/${courseId}`}>
          &larr; Back to course
        </Link>
      </div>
    </main>
  )
}
