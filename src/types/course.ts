export type CourseLevel = 'beginner' | 'intermediate' | 'advanced'
export type CourseStatus = 'draft' | 'published' | 'archived'

export interface Course {
  id: string
  title: string
  description: string
  level: CourseLevel
  status: CourseStatus
  thumbnail_url: string | null
  lesson_count: number
  created_at: string
  updated_at: string
}
