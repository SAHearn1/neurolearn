interface VideoLessonProps {
  src: string
  captionSrc?: string
  captionLabel?: string
}

export function VideoLesson({ src, captionSrc, captionLabel = 'English' }: VideoLessonProps) {
  return (
    <video className="w-full rounded-lg" controls src={src} crossOrigin="anonymous">
      <track kind="captions" src={captionSrc ?? ''} srcLang="en" label={captionLabel} default />
    </video>
  )
}
