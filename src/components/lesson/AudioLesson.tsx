interface AudioLessonProps {
  src: string
  transcript?: string | null
}

export function AudioLesson({ src, transcript }: AudioLessonProps) {
  return (
    <div className="space-y-3">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio className="w-full" controls src={src} />
      {transcript !== undefined && (
        <p className="text-sm text-slate-500 italic">{transcript ?? 'Transcript not available.'}</p>
      )}
    </div>
  )
}
