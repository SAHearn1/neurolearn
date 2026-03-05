import { useCallback, useRef, useState } from 'react'

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void
  disabled?: boolean
}

type SpeechRecognitionInstance = {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  onresult:
    | ((ev: { results: { [i: number]: { [i: number]: { transcript: string } } } }) => void)
    | null
  onerror: (() => void) | null
  onend: (() => void) | null
}

// Module-level support check — runs once, no DOM mutation, avoids setState-in-effect
const SPEECH_SUPPORTED =
  typeof window !== 'undefined' &&
  !!(
    (window as { SpeechRecognition?: unknown }).SpeechRecognition ??
    (window as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
  )

function newRecognition(): SpeechRecognitionInstance | null {
  const Ctor =
    (window as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ??
    (window as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance })
      .webkitSpeechRecognition
  return Ctor ? new Ctor() : null
}

/**
 * Microphone button that transcribes speech to text via Web Speech API.
 * Appends the transcript to the parent field via onTranscript.
 * Renders nothing when the browser does not support the API.
 */
export function VoiceInputButton({ onTranscript, disabled = false }: VoiceInputButtonProps) {
  const [recording, setRecording] = useState(false)
  const recRef = useRef<SpeechRecognitionInstance | null>(null)

  const start = useCallback(() => {
    if (!SPEECH_SUPPORTED || recording) return
    const rec = newRecognition()
    if (!rec) return

    rec.continuous = false
    rec.interimResults = false
    rec.lang = 'en-US'
    rec.onresult = (ev) => {
      const transcript = ev.results[0][0].transcript
      onTranscript(transcript)
    }
    rec.onerror = () => setRecording(false)
    rec.onend = () => setRecording(false)

    recRef.current = rec
    rec.start()
    setRecording(true)
  }, [recording, onTranscript])

  const stop = useCallback(() => {
    recRef.current?.stop()
    setRecording(false)
  }, [])

  if (!SPEECH_SUPPORTED) return null

  return (
    <button
      type="button"
      aria-label={recording ? 'Stop recording' : 'Start voice input'}
      onClick={recording ? stop : start}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 ${
        recording
          ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
          : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {recording ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          Stop
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3.5 w-3.5"
            aria-hidden="true"
          >
            <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
            <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5H10.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
          </svg>
          Speak
        </>
      )}
    </button>
  )
}
