export type ProgressStatus = 'not_started' | 'in_progress' | 'completed'

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  course_id: string
  status: ProgressStatus
  score: number | null
  time_spent_seconds: number
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface CourseProgress {
  course_id: string
  user_id: string
  total_lessons: number
  completed_lessons: number
  percent_complete: number
  status: ProgressStatus
}
