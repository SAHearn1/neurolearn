interface AudioLessonProps {
  src: string
}

export function AudioLesson({ src }: AudioLessonProps) {
  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <audio className="w-full" controls src={src} />
  )
}
