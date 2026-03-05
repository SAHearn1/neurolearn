import { useState, useEffect } from 'react'
import { RichContentPanel } from './RichContentPanel'
import { ListenMode } from './ListenMode'
import { EnhancedVideoLesson } from './EnhancedVideoLesson'
import { MultipleChoiceQuiz } from './MultipleChoiceQuiz'
import { ReflectionActivity } from './ReflectionActivity'
import { useContentSettings } from '../../hooks/useContentSettings'
import type { Lesson } from '../../types/lesson'
import type { Question } from './MultipleChoiceQuiz'

interface LessonViewerProps {
  lesson: Lesson
  courseId?: string
}

type Mode = 'read' | 'listen' | 'watch' | 'practice'

function parseQuestions(content: string): Question[] | null {
  const match = content.match(/```json\s*([\s\S]*?)\s*```/)
  if (match) {
    try {
      const parsed = JSON.parse(match[1]) as unknown
      if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        typeof parsed[0] === 'object' &&
        parsed[0] !== null &&
        'prompt' in parsed[0] &&
        'options' in parsed[0]
      ) {
        return parsed as Question[]
      }
    } catch {
      // not valid JSON — fall through
    }
  }
  return null
}

const TAB_LABELS: Record<Mode, string> = {
  read: 'Read',
  listen: 'Listen',
  watch: 'Watch',
  practice: 'Practice',
}

export function LessonViewer({ lesson, courseId }: LessonViewerProps) {
  const { wrapperClass, fontClass, defaultMode } = useContentSettings()

  const hasVideo = lesson.type === 'video' || (lesson.content?.includes('<video') ?? false)
  const hasPractice = lesson.type === 'interactive' || lesson.type === 'quiz'

  const availableModes: Mode[] = ['read', 'listen']
  if (hasVideo) availableModes.push('watch')
  if (hasPractice) availableModes.push('practice')

  const storageKey = `neurolearn.lesson.${lesson.id}.mode`

  const [activeMode, setActiveMode] = useState<Mode>(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored && availableModes.includes(stored as Mode)) return stored as Mode
    if (availableModes.includes(defaultMode)) return defaultMode
    return 'read'
  })

  useEffect(() => {
    localStorage.setItem(storageKey, activeMode)
  }, [activeMode, storageKey])

  const content = lesson.content ?? ''
  const questions = hasPractice ? parseQuestions(content) : null

  // Access transcript if the lesson data contains it (extended field)
  const transcript = (lesson as Lesson & { transcript?: string | null }).transcript ?? null

  return (
    <div className={`${wrapperClass} ${fontClass} space-y-4`}>
      {/* Mode tab bar */}
      <div
        className="flex gap-1 border-b border-slate-200"
        role="tablist"
        aria-label="Lesson modes"
      >
        {availableModes.map((mode) => (
          <button
            key={mode}
            role="tab"
            aria-selected={activeMode === mode}
            onClick={() => setActiveMode(mode)}
            className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-brand-500 ${
              activeMode === mode
                ? 'border-b-2 border-brand-500 text-brand-700'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {TAB_LABELS[mode]}
          </button>
        ))}
      </div>

      {/* Active panel */}
      <div role="tabpanel">
        {activeMode === 'read' &&
          (content ? (
            <RichContentPanel content={content} />
          ) : (
            <p className="text-slate-500">No content available.</p>
          ))}

        {activeMode === 'listen' &&
          (content ? (
            <ListenMode content={content} />
          ) : (
            <p className="text-slate-500">No content to read aloud.</p>
          ))}

        {activeMode === 'watch' &&
          (lesson.type === 'video' && content ? (
            <EnhancedVideoLesson src={content} transcript={transcript} />
          ) : content ? (
            <RichContentPanel content={content} />
          ) : null)}

        {activeMode === 'practice' &&
          hasPractice &&
          (questions ? (
            <MultipleChoiceQuiz questions={questions} />
          ) : (
            <ReflectionActivity content={content} courseId={courseId} lessonId={lesson.id} />
          ))}
      </div>
    </div>
  )
}
