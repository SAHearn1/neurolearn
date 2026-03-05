import { useRef, useState } from 'react'

interface EnhancedVideoLessonProps {
  src: string
  captionSrc?: string
  captionLabel?: string
  transcript?: string | null
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const

export function EnhancedVideoLesson({
  src,
  captionSrc,
  captionLabel = 'English',
  transcript,
}: EnhancedVideoLessonProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [speed, setSpeed] = useState(1)
  const [transcriptOpen, setTranscriptOpen] = useState(false)

  const handleSpeedChange = (s: number) => {
    setSpeed(s)
    if (videoRef.current) videoRef.current.playbackRate = s
  }

  return (
    <div className="space-y-3">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        className="w-full rounded-lg"
        controls
        src={src}
        crossOrigin="anonymous"
      >
        {captionSrc && (
          <track kind="captions" src={captionSrc} srcLang="en" label={captionLabel} default />
        )}
      </video>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-600">Speed:</span>
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => handleSpeedChange(s)}
            className={`rounded px-2 py-0.5 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-brand-500 ${
              speed === s
                ? 'bg-brand-500 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50">
        <button
          className="flex w-full items-center justify-between px-4 py-2 text-sm font-medium text-slate-700 focus-visible:outline-2 focus-visible:outline-brand-500"
          onClick={() => setTranscriptOpen((o) => !o)}
          aria-expanded={transcriptOpen}
        >
          <span>Transcript</span>
          <span>{transcriptOpen ? '▲' : '▼'}</span>
        </button>
        {transcriptOpen && (
          <div className="border-t border-slate-200 px-4 py-3 text-sm text-slate-700">
            {transcript ? (
              <p className="whitespace-pre-wrap leading-relaxed">{transcript}</p>
            ) : (
              <p className="italic text-slate-400">Transcript not available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
