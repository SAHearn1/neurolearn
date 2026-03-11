import { useRef, useState, useEffect, useCallback } from 'react'
import { useSettingsStore } from '../../store/settingsStore'

interface AudioLessonProps {
  src: string
  transcript?: string | null
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function AudioLesson({ src, transcript }: AudioLessonProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [transcriptOpen, setTranscriptOpen] = useState(false)
  const reduceMotion = useSettingsStore((s) => s.accessibility.reduce_motion)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => setCurrentTime(audio.currentTime)
    const onDuration = () => setDuration(audio.duration)
    const onEnded = () => setPlaying(false)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onDuration)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onDuration)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      void audio.play()
      setPlaying(true)
    }
  }, [playing])

  const seek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Number(e.target.value)
    setCurrentTime(audio.currentTime)
  }, [])

  const changeSpeed = useCallback((s: number) => {
    setSpeed(s)
    if (audioRef.current) audioRef.current.playbackRate = s
  }, [])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Progress bar / seek */}
      <div className="space-y-1">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={seek}
          className="h-2 w-full cursor-pointer accent-brand-500"
          aria-label="Audio position"
          aria-valuenow={Math.round(currentTime)}
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
        />
        <div className="flex justify-between text-xs text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Play/pause + speed */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? 'Pause' : 'Play'}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 text-white shadow-brand transition hover:bg-brand-600 focus-visible:outline-2 focus-visible:outline-brand-500"
        >
          {playing ? (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5 translate-x-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        {/* Progress visual */}
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-full rounded-full bg-brand-500 ${reduceMotion ? '' : 'transition-all duration-150'}`}
            style={{ width: `${progress}%` }}
            role="presentation"
          />
        </div>

        {/* Speed controls */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500">Speed:</span>
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => changeSpeed(s)}
              aria-pressed={speed === s}
              className={`rounded px-2 py-0.5 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-brand-500 ${
                speed === s
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Transcript accordion */}
      {transcript !== undefined && (
        <div className="rounded-lg border border-slate-200 bg-white">
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium text-slate-700 focus-visible:outline-2 focus-visible:outline-brand-500"
            onClick={() => setTranscriptOpen((o) => !o)}
            aria-expanded={transcriptOpen}
          >
            <span>Transcript</span>
            <span aria-hidden="true">{transcriptOpen ? '▲' : '▼'}</span>
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
      )}
    </div>
  )
}
