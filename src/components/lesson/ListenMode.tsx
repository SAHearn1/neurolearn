import { useState, useEffect, useRef, useCallback } from 'react'
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

const SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const

export function ListenMode({ content }: ListenModeProps) {
  const reduceMotion = useSettingsStore((s) => s.accessibility.reduce_motion)
  const [supported] = useState(() => 'speechSynthesis' in window)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>('')
  const [speed, setSpeed] = useState<number>(1)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const plainText = useRef(stripHtml(content))

  useEffect(() => {
    plainText.current = stripHtml(content)
  }, [content])

  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices()
      if (v.length) {
        setVoices(v)
        const en = v.find((voice) => voice.lang.startsWith('en'))
        setSelectedVoice(en?.name ?? v[0]?.name ?? '')
      }
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setPlaying(false)
    setProgress(0)
  }, [])

  const play = useCallback(() => {
    stop()
    const utterance = new SpeechSynthesisUtterance(plainText.current)
    utterance.rate = speed
    const voice = voices.find((v) => v.name === selectedVoice)
    if (voice) utterance.voice = voice

    const totalLen = plainText.current.length
    utterance.onboundary = (e) => {
      setProgress(Math.round((e.charIndex / totalLen) * 100))
    }
    utterance.onend = () => {
      setPlaying(false)
      setProgress(100)
    }
    utterance.onerror = () => setPlaying(false)

    window.speechSynthesis.speak(utterance)
    setPlaying(true)
  }, [speed, selectedVoice, voices, stop])

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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button onClick={playing ? pause : play} variant={playing ? 'secondary' : 'primary'}>
          {playing ? '⏸ Pause' : '▶ Play'}
        </Button>
        <Button variant="secondary" onClick={stop} disabled={!playing && progress === 0}>
          ⏹ Stop
        </Button>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-2 rounded-full bg-brand-500 ${reduceMotion ? '' : 'transition-all duration-300'}`}
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
          Speed
          <select
            className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          >
            {SPEEDS.map((s) => (
              <option key={s} value={s}>
                {s}x
              </option>
            ))}
          </select>
        </label>

        {voices.length > 1 && (
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Voice
            <select
              className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
            >
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </div>
  )
}
