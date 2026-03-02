import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { LessonCard } from '../components/lesson/LessonCard'
import { LessonNav } from '../components/lesson/LessonNav'
import { QuizBlock } from '../components/lesson/QuizBlock'
import { TextLesson } from '../components/lesson/TextLesson'
import { useAuth } from '../hooks/useAuth'
import { useLessons } from '../hooks/useLessons'
import { useProgress } from '../hooks/useProgress'

export function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const { lessons } = useLessons(courseId)
  const { userId } = useAuth()
  const { markLessonCompleted } = useProgress(userId ?? 'demo-user')

  const lesson = useMemo(() => lessons.find((entry) => entry.id === lessonId), [lessonId, lessons])
  const nextLesson = useMemo(() => {
    const index = lessons.findIndex((entry) => entry.id === lessonId)
    return index >= 0 ? lessons[index + 1] : undefined
  }, [lessonId, lessons])

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Lesson</p>
        <h1 className="text-3xl font-bold text-slate-900">{lesson?.title ?? lessonId ?? 'Current lesson'}</h1>
        <p className="text-slate-600">Course: {courseId}</p>
      </header>

      <LessonCard title={lesson?.title ?? 'Build an effective reset routine'} type={lesson?.contentType ?? 'text'}>
        <TextLesson
          body={
            lesson?.contentBody ??
            'When focus drops, use a short reset: stand up, stretch for one minute, and write the next smallest task you can complete.'
          }
        />
      </LessonCard>

      <button
        className="w-fit rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
        onClick={() => {
          if (lessonId) {
            void markLessonCompleted(lessonId, userId ?? 'demo-user')
          }
        }}
        type="button"
      >
        Mark lesson complete
      </button>

      <QuizBlock answer="smallest task" prompt="What should you identify after your reset break?" />

      <LessonNav
        backTo={`/courses/${courseId}`}
        nextTo={nextLesson ? `/courses/${courseId}/lessons/${nextLesson.id}` : undefined}
      />
    </main>
  )
}
