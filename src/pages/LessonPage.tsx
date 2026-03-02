import { LessonCard } from '../components/lesson/LessonCard'
import { LessonNav } from '../components/lesson/LessonNav'
import { QuizBlock } from '../components/lesson/QuizBlock'
import { TextLesson } from '../components/lesson/TextLesson'
import { useParams } from 'react-router-dom'

export function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Lesson</p>
        <h1 className="text-3xl font-bold text-slate-900">{lessonId ?? 'Current lesson'}</h1>
        <p className="text-slate-600">Course: {courseId}</p>
      </header>

      <LessonCard title="Build an effective reset routine" type="text">
        <TextLesson body="When focus drops, use a short reset: stand up, stretch for one minute, and write the next smallest task you can complete." />
      </LessonCard>

      <QuizBlock answer="smallest task" prompt="What should you identify after your reset break?" />

      <LessonNav backTo={`/courses/${courseId}`} nextTo={undefined} />
    </main>
  )
}
