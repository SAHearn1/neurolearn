export interface Course {
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  id: string
  tags: string[]
  title: string
}
