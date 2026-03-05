import { EnhancedVideoLesson } from './EnhancedVideoLesson'

interface VideoLessonProps {
  src: string
  captionSrc?: string
  captionLabel?: string
}

export function VideoLesson({ src, captionSrc, captionLabel }: VideoLessonProps) {
  return <EnhancedVideoLesson src={src} captionSrc={captionSrc} captionLabel={captionLabel} />
}
