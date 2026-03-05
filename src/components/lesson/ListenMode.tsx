import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '../ui/Button'
import { useSettingsStore } from '../../store/settingsStore'

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

const SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const

export function ListenMode({ content }: ListenModeProps) {
  const reduceMotion = useSettingsStore((s) => s.accessibility.reduce_motion)
  const [supported] = useState(() => 'speechSynthesis' in window)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>('')
  const [speed, setSpeed] = useState<number>(1)
  const [playing, setPlaying] = useState(false)
  const [charIndex, setCharIndex] = useState(-1)

  const plainText = useMemo(() => stripHtml(content), [content])
  const tokens = useMemo(() => tokenise(plainText), [plainText])
  const enVoices = useMemo(() => voices.filter((v) => v.lang.startsWith('en')), [voices])

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

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setPlaying(false)
    setCharIndex(-1)
  }, [])

  const play = useCallback(() => {
    stop()
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
    utterance.onerror = () => setPlaying(false)

    window.speechSynthesis.speak(utterance)
    setPlaying(true)
    setCharIndex(0)
  }, [speed, selectedVoice, voices, stop, plainText])

  const pause = useCallback(() => {
    if (playing) {
      window.speechSynthesis.pause()
      setPlaying(false)
    } else {
      window.speechSynthesis.resume()
      setPlaying(true)
    }
  }, [playing])

  useEffect(() => () => stop(), [stop])

  if (!supported) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Text-to-speech is not supported in your browser. Try Chrome or Edge for the best experience.
      </div>
    )
  }

  const progress = charIndex < 0 ? 0 : Math.round((charIndex / plainText.length) * 100)

  return (
    <div className="space-y-4">
      {/* Playback controls */}
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={playing ? pause : play} variant={playing ? 'secondary' : 'primary'}>
          {playing ? '⏸ Pause' : '▶ Play'}
        </Button>
        <Button variant="secondary" onClick={stop} disabled={charIndex < 0}>
          ⏹ Stop
        </Button>

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

      {/* Voice selector — English voices only, sorted naturally first */}
      {enVoices.length > 1 && (
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

      {/* Karaoke text — words highlight as they're spoken */}
      <div
        className="max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-700"
        aria-live="off"
        aria-label="Lesson text"
      >
        {tokens.map((tok, i) => {
          // find next non-whitespace token to determine word end
          const nextWordIdx = tokens.findIndex((t, j) => j > i && t.text.trim().length > 0)
          const nextStart = nextWordIdx >= 0 ? tokens[nextWordIdx].start : plainText.length
          const isWord = tok.text.trim().length > 0
          const isActive = isWord && charIndex >= tok.start && charIndex < nextStart
          const isPast = isWord && charIndex >= nextStart

          return (
            <span
              key={i}
              className={
                isActive
                  ? `rounded bg-brand-200 px-0.5 text-brand-900 ${reduceMotion ? '' : 'transition-colors duration-75'}`
                  : isPast
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
