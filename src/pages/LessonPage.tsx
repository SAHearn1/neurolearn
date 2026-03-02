import { Link, useParams } from 'react-router-dom'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { TextLesson } from '../components/lesson/TextLesson'
import { VideoLesson } from '../components/lesson/VideoLesson'
import { AudioLesson } from '../components/lesson/AudioLesson'
import { useLesson } from '../hooks/useLessons'
import { racaFlags } from '../lib/raca/feature-flags'

export function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const { lesson, loading, error } = useLesson(lessonId)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <main id="main-content" className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Lesson</p>
        <h1 className="text-3xl font-bold text-slate-900">{lesson?.title ?? 'Lesson'}</h1>
        {lesson?.description && (
          <p className="mt-1 text-slate-600">{lesson.description}</p>
        )}
        {lesson?.duration_minutes && (
          <p className="mt-1 text-xs text-slate-400">{lesson.duration_minutes} min read</p>
        )}
      </header>

      {error && <Alert variant="error">{error}</Alert>}

      {lesson && (
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {lesson.type === 'text' && lesson.content && <TextLesson body={lesson.content} />}
          {lesson.type === 'video' && lesson.content && <VideoLesson src={lesson.content} />}
          {lesson.type === 'audio' && lesson.content && <AudioLesson src={lesson.content} />}
          {(lesson.type === 'interactive' || lesson.type === 'quiz') && (
            <p className="leading-relaxed text-slate-700">
              Interactive content for this lesson is loading. Stay tuned.
            </p>
          )}
          {!lesson.content && (
            <p className="leading-relaxed text-slate-500">Content coming soon.</p>
          )}
        </article>
      )}

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
