export interface EducatorProfile {
  user_id: string
  school_name: string | null
  department: string | null
  subjects: string[]
  certifications: string[]
  bio: string | null
  years_experience: number
  max_class_size: number
  accepting_students: boolean
  created_at: string
  updated_at: string
}

export interface ClassRecord {
  id: string
  educator_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface ClassEnrollment {
  id: string
  class_id: string
  student_id: string
  enrolled_at: string
}

export interface ClassWithStudents extends ClassRecord {
  enrollments: (ClassEnrollment & {
    student: { user_id: string; display_name: string; avatar_url: string | null }
  })[]
}
