import { RichContentPanel } from './RichContentPanel'

interface TextLessonProps {
  body: string
}

export function TextLesson({ body }: TextLessonProps) {
  return <RichContentPanel content={body} />
}
