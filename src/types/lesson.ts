export type LessonType = 'text' | 'video' | 'audio' | 'interactive' | 'quiz'
export type LessonStatus = 'draft' | 'published' | 'archived'

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
  created_at: string
  updated_at: string
}
