export type LessonContentType = 'text' | 'audio' | 'video' | 'interactive'

export interface Lesson {
  contentBody?: string
  contentType: LessonContentType
  contentUrl?: string
  courseId: string
  id: string
  orderIndex: number
  title: string
}
