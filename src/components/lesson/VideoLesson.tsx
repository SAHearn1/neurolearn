interface VideoLessonProps {
  src: string
}

export function VideoLesson({ src }: VideoLessonProps) {
  return <video className="w-full rounded-lg" controls src={src} />
}
