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

// Playback mode:
//   'idle'        — not started
//   'el-loading'  — fetching ElevenLabs audio
//   'el-playing'  — HTMLAudioElement playing ElevenLabs audio
//   'ss-playing'  — window.speechSynthesis playing (fallback)
//   'paused'      — paused (either path)
//   'done'        — finished
type PlaybackMode = 'idle' | 'el-loading' | 'el-playing' | 'ss-playing' | 'paused' | 'done'

export function ListenMode({ content }: ListenModeProps) {
  const reduceMotion = useSettingsStore((s) => s.accessibility.reduce_motion)
  const [supported] = useState(() => 'speechSynthesis' in window)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>('')
  const [speed, setSpeed] = useState<number>(1)
  const [mode, setMode] = useState<PlaybackMode>('idle')
  // charIndex drives karaoke highlighting (speechSynthesis path uses word boundaries;
  // ElevenLabs path uses audio.currentTime / duration ratio — approximate)
  const [charIndex, setCharIndex] = useState(-1)
  // Whether to attempt ElevenLabs this session (disabled on first failure)
  const [elEnabled, setElEnabled] = useState(true)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const blobUrlRef = useRef<string | null>(null)
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

  // Auto-scroll active word into view when charIndex advances
  useEffect(() => {
    if (!reduceMotion && activeWordRef.current) {
      activeWordRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [charIndex, reduceMotion])

  const revokeBlobUrl = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
  }, [])

  const stopAll = useCallback(() => {
    window.speechSynthesis.cancel()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    revokeBlobUrl()
    setMode('idle')
    setCharIndex(-1)
  }, [revokeBlobUrl])

  // ElevenLabs playback path
  const playElevenLabs = useCallback(async (): Promise<boolean> => {
    setMode('el-loading')
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) return false

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
      const res = await fetch(`${supabaseUrl}/functions/v1/tts-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: plainText }),
      })

      const contentType = res.headers.get('content-type') ?? ''
      if (!res.ok || !contentType.includes('audio')) {
        setElEnabled(false)
        setMode('idle')
        return false
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      blobUrlRef.current = url

      const audio = new Audio(url)
      audioRef.current = audio
      audio.playbackRate = speed

      audio.onended = () => {
        setMode('done')
        setCharIndex(plainText.length)
        revokeBlobUrl()
      }
      audio.onerror = () => {
        setMode('idle')
        revokeBlobUrl()
      }
      audio.ontimeupdate = () => {
        const ratio = audio.currentTime / (audio.duration || 1)
        setCharIndex(Math.floor(ratio * plainText.length))
      }

      await audio.play()
      setMode('el-playing')
      return true
    } catch {
      setElEnabled(false)
      setMode('idle')
      return false
    }
  }, [plainText, speed, revokeBlobUrl])

  // SpeechSynthesis playback path (karaoke with word-boundary events)
  const playSpeechSynthesis = useCallback(() => {
    const utterance = new SpeechSynthesisUtterance(plainText)
    utterance.rate = speed
    const voice = voices.find((v) => v.name === selectedVoice)
    if (voice) utterance.voice = voice

    utterance.onboundary = (e) => {
      if (e.name === 'word') setCharIndex(e.charIndex)
    }
    utterance.onend = () => {
      setMode('done')
      setCharIndex(plainText.length)
    }
    utterance.onerror = () => setMode('idle')

    window.speechSynthesis.speak(utterance)
    setMode('ss-playing')
    setCharIndex(0)
  }, [plainText, speed, selectedVoice, voices])

  const play = useCallback(async () => {
    stopAll()
    if (elEnabled) {
      const success = await playElevenLabs()
      if (!success) playSpeechSynthesis()
    } else {
      playSpeechSynthesis()
    }
  }, [elEnabled, stopAll, playElevenLabs, playSpeechSynthesis])

  const pause = useCallback(() => {
    if (mode === 'el-playing') {
      audioRef.current?.pause()
      setMode('paused')
    } else if (mode === 'paused' && audioRef.current) {
      audioRef.current.play()
      setMode('el-playing')
    } else if (mode === 'ss-playing') {
      window.speechSynthesis.pause()
      setMode('paused')
    } else if (mode === 'paused') {
      window.speechSynthesis.resume()
      setMode('ss-playing')
    }
  }, [mode])

  useEffect(() => () => stopAll(), [stopAll])

  if (!supported) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Text-to-speech is not supported in your browser. Try Chrome or Edge for the best experience.
      </div>
    )
  }

  const playing = mode === 'el-playing' || mode === 'ss-playing'
  const isPaused = mode === 'paused'
  const isLoading = mode === 'el-loading'
  const progress = charIndex < 0 ? 0 : Math.round((charIndex / plainText.length) * 100)

  const buttonLabel = isLoading
    ? '⏳ Loading…'
    : playing
      ? '⏸ Pause'
      : isPaused
        ? '▶ Resume'
        : '▶ Play'

  return (
    <div className="space-y-4">
      {/* Playback controls */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={playing || isPaused ? pause : () => void play()}
          variant={playing ? 'secondary' : 'primary'}
          disabled={isLoading}
          aria-label={buttonLabel}
        >
          {buttonLabel}
        </Button>
        <Button variant="secondary" onClick={stopAll} disabled={mode === 'idle'} aria-label="Stop">
          ⏹ Stop
        </Button>

        {mode === 'el-playing' && (
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

      {/* Voice selector — speechSynthesis only; hidden when using ElevenLabs */}
      {!elEnabled && enVoices.length > 1 && (
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
          aria-label="Playback progress"
        />
      </div>

      {/* Karaoke text — active word highlighted and auto-scrolled into view */}
      <div
        className="max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-700"
        aria-live="off"
        aria-label="Lesson text"
      >
        {tokens.map((tok, i) => {
          const nextWordIdx = tokens.findIndex((t, j) => j > i && t.text.trim().length > 0)
          const nextStart = nextWordIdx >= 0 ? tokens[nextWordIdx].start : plainText.length
          const isWord = tok.text.trim().length > 0
          const isActive = isWord && charIndex >= tok.start && charIndex < nextStart
          const isPastWord = isWord && charIndex >= nextStart

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
