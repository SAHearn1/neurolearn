interface AudioLessonProps {
  src: string
}

export function AudioLesson({ src }: AudioLessonProps) {
  return <audio className="w-full" controls src={src} />
}
