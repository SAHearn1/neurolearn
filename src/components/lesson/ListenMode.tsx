import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Button } from '../ui/Button'
import { useSettingsStore } from '../../store/settingsStore'
import { supabase } from '../../../utils/supabase/client'

interface ListenModeProps {
  content: string
}

function stripHtml(html: string): string {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent ?? tmp.innerText ?? ''
}

// Tokenise plain text into word/whitespace spans so we can highlight word-by-word
function tokenise(text: string): { text: string; start: number }[] {
  const tokens: { text: string; start: number }[] = []
  const re = /\S+|\s+/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    tokens.push({ text: m[0], start: m.index })
  }
  return tokens
}

// Prefer natural-sounding voices: Google Neural > Microsoft Neural > any English
function pickBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  const tests: ((v: SpeechSynthesisVoice) => boolean)[] = [
    (v) => /natural|neural|enhanced/i.test(v.name) && v.lang.startsWith('en'),
    (v) => v.name.startsWith('Google') && v.lang.startsWith('en'),
    (v) => v.name.startsWith('Microsoft') && v.lang.startsWith('en'),
    (v) => v.lang.startsWith('en-US'),
    (v) => v.lang.startsWith('en'),
  ]
  for (const test of tests) {
    const match = voices.find(test)
    if (match) return match
  }
  return voices[0]
}

function voiceQuality(v: SpeechSynthesisVoice): 0 | 1 | 2 {
  if (/natural|neural|enhanced/i.test(v.name)) return 0
  if (v.name.startsWith('Google') || v.name.startsWith('Microsoft')) return 1
  return 2
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const

type AudioMode = 'idle' | 'loading' | 'elevenlabs' | 'browser'

export function ListenMode({ content }: ListenModeProps) {
  const reduceMotion = useSettingsStore((s) => s.accessibility.reduce_motion)
  const [supported] = useState(() => 'speechSynthesis' in window)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>('')
  const [speed, setSpeed] = useState<number>(1)
  const [playing, setPlaying] = useState(false)
  const [charIndex, setCharIndex] = useState(-1)
  const [audioMode, setAudioMode] = useState<AudioMode>('idle')
  const [elProgress, setElProgress] = useState(0)

  const audioRef = useRef<HTMLAudioElement>(null)
  const elAudioUrlRef = useRef<string | null>(null)
  const activeWordRef = useRef<HTMLSpanElement | null>(null)

  const plainText = useMemo(() => stripHtml(content), [content])
  const tokens = useMemo(() => tokenise(plainText), [plainText])

  // English voices sorted: neural/natural first, then Google/Microsoft, then others
  const enVoices = useMemo(
    () =>
      voices
        .filter((v) => v.lang.startsWith('en'))
        .slice()
        .sort((a, b) => voiceQuality(a) - voiceQuality(b)),
    [voices],
  )

  useEffect(() => {
    const load = () => {
      const v = window.speechSynthesis.getVoices()
      if (!v.length) return
      setVoices(v)
      setSelectedVoice((cur) => cur || (pickBestVoice(v)?.name ?? ''))
    }
    load()
    window.speechSynthesis.onvoiceschanged = load
    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

  // Auto-scroll active word into view whenever charIndex advances
  useEffect(() => {
    if (!reduceMotion && activeWordRef.current) {
      activeWordRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [charIndex, reduceMotion])

  // Revoke EL blob URL on unmount
  useEffect(() => {
    return () => {
      if (elAudioUrlRef.current) URL.revokeObjectURL(elAudioUrlRef.current)
    }
  }, [])

  // Apply speed to HTML audio element whenever it changes
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed
  }, [speed])

  const stopBrowser = useCallback(() => {
    window.speechSynthesis.cancel()
  }, [])

  const stop = useCallback(() => {
    stopBrowser()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setPlaying(false)
    setCharIndex(-1)
    setElProgress(0)
    setAudioMode('idle')
  }, [stopBrowser])

  const tryElevenLabs = useCallback(async (): Promise<string | null> => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token || !supabaseUrl) return null

      const res = await fetch(`${supabaseUrl}/functions/v1/tts-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: plainText }),
      })

      const ct = res.headers.get('content-type') ?? ''
      if (!res.ok || !ct.includes('audio')) return null

      const blob = await res.blob()
      if (elAudioUrlRef.current) URL.revokeObjectURL(elAudioUrlRef.current)
      const url = URL.createObjectURL(blob)
      elAudioUrlRef.current = url
      return url
    } catch {
      return null
    }
  }, [plainText])

  const playBrowser = useCallback(() => {
    const utterance = new SpeechSynthesisUtterance(plainText)
    utterance.rate = speed
    const voice = voices.find((v) => v.name === selectedVoice)
    if (voice) utterance.voice = voice

    utterance.onboundary = (e) => {
      if (e.name === 'word') setCharIndex(e.charIndex)
    }
    utterance.onend = () => {
      setPlaying(false)
      setCharIndex(plainText.length)
    }
    utterance.onerror = () => {
      setPlaying(false)
      setAudioMode('idle')
    }

    window.speechSynthesis.speak(utterance)
    setPlaying(true)
    setCharIndex(0)
    setAudioMode('browser')
  }, [speed, selectedVoice, voices, plainText])

  const play = useCallback(async () => {
    stop()
    setAudioMode('loading')

    const elUrl = await tryElevenLabs()
    if (elUrl && audioRef.current) {
      audioRef.current.src = elUrl
      audioRef.current.playbackRate = speed
      audioRef.current.play().catch(() => {
        // EL audio playback failed — fall through to browser
        playBrowser()
      })
      setPlaying(true)
      setAudioMode('elevenlabs')
    } else {
      playBrowser()
    }
  }, [stop, tryElevenLabs, speed, playBrowser])

  const pause = useCallback(() => {
    if (audioMode === 'elevenlabs' && audioRef.current) {
      if (playing) {
        audioRef.current.pause()
        setPlaying(false)
      } else {
        audioRef.current.play().catch(() => undefined)
        setPlaying(true)
      }
    } else {
      if (playing) {
        window.speechSynthesis.pause()
        setPlaying(false)
      } else {
        window.speechSynthesis.resume()
        setPlaying(true)
      }
    }
  }, [playing, audioMode])

  useEffect(() => () => stop(), [stop])

  if (!supported) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Text-to-speech is not supported in your browser. Try Chrome or Edge for the best experience.
      </div>
    )
  }

  const isPaused = !playing && (charIndex >= 0 || (audioMode === 'elevenlabs' && elProgress > 0))
  const progress =
    audioMode === 'elevenlabs'
      ? elProgress
      : charIndex < 0
        ? 0
        : Math.round((charIndex / plainText.length) * 100)

  return (
    <div className="space-y-4">
      {/* Hidden HTML audio element for ElevenLabs playback */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption -- captions not applicable for dynamic TTS audio */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          const el = audioRef.current
          if (el && el.duration) setElProgress(Math.round((el.currentTime / el.duration) * 100))
        }}
        onEnded={() => {
          setPlaying(false)
          setElProgress(100)
          setAudioMode('idle')
        }}
        onError={() => {
          setPlaying(false)
          setAudioMode('idle')
        }}
      />

      {/* Playback controls */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={
            audioMode === 'loading'
              ? undefined
              : playing
                ? pause
                : isPaused
                  ? pause
                  : () => void play()
          }
          variant={playing ? 'secondary' : 'primary'}
          disabled={audioMode === 'loading'}
        >
          {audioMode === 'loading'
            ? '⏳ Loading…'
            : playing
              ? '⏸ Pause'
              : isPaused
                ? '▶ Resume'
                : '▶ Play'}
        </Button>
        <Button variant="secondary" onClick={stop} disabled={audioMode === 'idle'}>
          ⏹ Stop
        </Button>

        {audioMode === 'elevenlabs' && (
          <span className="text-xs text-slate-400" title="Powered by ElevenLabs">
            ✦ AI voice
          </span>
        )}

        <div className="ml-auto flex items-center gap-1">
          <span className="text-xs text-slate-500">Speed:</span>
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`rounded px-2 py-0.5 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-brand-500 ${
                speed === s
                  ? 'bg-brand-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Voice selector — only shown in browser mode */}
      {audioMode !== 'elevenlabs' && enVoices.length > 1 && (
        <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
          Voice:
          <select
            className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
          >
            {enVoices.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name}
                {/natural|neural|enhanced/i.test(v.name) ? ' ✦' : ''}
              </option>
            ))}
          </select>
        </label>
      )}

      {/* Progress bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full bg-brand-500 ${reduceMotion ? '' : 'transition-all duration-150'}`}
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Karaoke text — active word auto-scrolls into view (browser mode only) */}
      <div
        className="max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-700"
        aria-live="off"
        aria-label="Lesson text"
      >
        {tokens.map((tok, i) => {
          const nextWordIdx = tokens.findIndex((t, j) => j > i && t.text.trim().length > 0)
          const nextStart = nextWordIdx >= 0 ? tokens[nextWordIdx].start : plainText.length
          const isWord = tok.text.trim().length > 0
          const isActive =
            audioMode === 'browser' && isWord && charIndex >= tok.start && charIndex < nextStart
          const isPastWord = audioMode === 'browser' && isWord && charIndex >= nextStart

          return (
            <span
              key={i}
              ref={isActive ? activeWordRef : null}
              className={
                isActive
                  ? `rounded bg-brand-200 px-0.5 text-brand-900 ${reduceMotion ? '' : 'transition-colors duration-75'}`
                  : isPastWord
                    ? 'text-slate-400'
                    : ''
              }
            >
              {tok.text}
            </span>
          )
        })}
      </div>
    </div>
  )
}
