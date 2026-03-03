export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading'
export type UserRole = 'learner' | 'parent' | 'educator' | 'admin'

export interface AccessibilityPreferences {
  text_size: 'small' | 'medium' | 'large'
  reduce_motion: boolean
  high_contrast: boolean
  screen_reader_hints: boolean
}

export interface UserProfile {
  id: string
  user_id: string
  display_name: string
  avatar_url: string | null
  role: UserRole
  learning_styles: LearningStyle[]
  accessibility: AccessibilityPreferences
  streak_days: number
  lessons_completed: number
  created_at: string
  updated_at: string
}

// Re-export educator and parent profile types for unified access
export type { EducatorProfile, EducatorStudentLink } from './educator'
export type { ParentProfile, ParentStudentLink } from './parent'
