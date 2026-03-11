import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
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

// Inline SVG icons — no external dependency required
function BookIcon() {
  return (
    <svg
      className="h-4 w-4 flex-shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  )
}

function HeadphonesIcon() {
  return (
    <svg
      className="h-4 w-4 flex-shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 18v-6a9 9 0 0118 0v6" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"
      />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg
      className="h-4 w-4 flex-shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg
      className="h-4 w-4 flex-shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  )
}

const TAB_CONFIG: Record<Mode, { label: string; icon: ReactNode }> = {
  read: { label: 'Read', icon: <BookIcon /> },
  listen: { label: 'Listen', icon: <HeadphonesIcon /> },
  watch: { label: 'Watch', icon: <PlayIcon /> },
  practice: { label: 'Practice', icon: <PencilIcon /> },
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
    <div className={`${wrapperClass} ${fontClass} space-y-5`}>
      {/* Segmented pill tab bar */}
      <div
        className="flex gap-1 rounded-xl bg-slate-100 p-1"
        role="tablist"
        aria-label="Lesson modes"
      >
        {availableModes.map((mode) => {
          const { label, icon } = TAB_CONFIG[mode]
          return (
            <button
              key={mode}
              role="tab"
              aria-selected={activeMode === mode}
              onClick={() => setActiveMode(mode)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                activeMode === mode
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {icon}
              <span>{label}</span>
            </button>
          )
        })}
      </div>

      {/* Active panel */}
      <div role="tabpanel" className="animate-fade-in">
        {activeMode === 'read' &&
          (content ? (
            <RichContentPanel
              content={content}
              glossary={(lesson as Lesson & { glossary?: Record<string, string> }).glossary}
            />
          ) : (
            <p className="py-8 text-center text-slate-400">No content available.</p>
          ))}

        {activeMode === 'listen' &&
          (content ? (
            <ListenMode content={content} />
          ) : (
            <p className="py-8 text-center text-slate-400">No content to read aloud.</p>
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
