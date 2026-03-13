export type LessonType = 'text' | 'video' | 'audio' | 'interactive' | 'quiz'
export type LessonStatus = 'draft' | 'published' | 'archived'

/** ASS-03: Voice Input Pathway — tracks whether input was typed or dictated */
export type InputMode = 'text' | 'voice'

export interface Lesson {
  id: string
  course_id: string
  title: string
  description: string
  type: LessonType
  status: LessonStatus
  content: string | null
  sort_order: number
  duration_minutes: number | null
  raca_phase?: string | null
  learning_objectives?: string[] | null
  glossary?: Record<string, string> | null
  created_at: string
  updated_at: string
}
