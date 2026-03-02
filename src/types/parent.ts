export type RelationshipType = 'parent' | 'guardian' | 'caregiver' | 'other'
export type ContactPreference = 'email' | 'phone' | 'both' | 'none'
export type NotificationFrequency = 'daily' | 'weekly' | 'monthly' | 'immediate'

export interface ParentProfile {
  user_id: string
  relationship_type: RelationshipType
  contact_phone: string | null
  contact_preference: ContactPreference
  notification_frequency: NotificationFrequency
  notification_email: boolean
  notification_push: boolean
  timezone: string
  max_linked_students: number
  created_at: string
  updated_at: string
}

export interface ParentStudentLink {
  id: string
  parent_id: string
  student_id: string
  status: 'pending' | 'active' | 'approved' | 'revoked' | 'rejected'
  created_at: string
}

export interface LinkedStudent {
  link: ParentStudentLink
  student: {
    user_id: string
    display_name: string
    avatar_url: string | null
    streak_days: number
    lessons_completed: number
  }
}
