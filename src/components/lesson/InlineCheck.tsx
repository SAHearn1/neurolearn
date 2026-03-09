import { useState } from 'react'
import { useSettingsStore } from '../../store/settingsStore'

interface CheckOption {
  key: string
  text: string
}

interface InlineCheckProps {
  question: string
  options: CheckOption[]
  correctKey: string
  explanation: string
}

export function InlineCheck({ question, options, correctKey, explanation }: InlineCheckProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const dyslexiaFont = useSettingsStore((s) => s.accessibility.dyslexia_font)
  const answered = selected !== null
  const isCorrect = selected === correctKey

  return (
    <div
      className={`my-6 rounded-xl border-2 border-brand-200 bg-brand-50 p-5 ${dyslexiaFont ? 'font-dyslexia' : ''}`}
      role="group"
      aria-label="Knowledge check"
    >
      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-brand-600">
        Check your thinking
      </p>
      <p className="mb-4 text-sm font-semibold text-slate-900">{question}</p>

      <div className="space-y-2">
        {options.map((opt) => {
          const isSelected = selected === opt.key
          const isRight = opt.key === correctKey
          let style = 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
          if (answered && isSelected && isCorrect)
            style = 'border-emerald-500 bg-emerald-50 text-emerald-800'
          else if (answered && isSelected && !isCorrect)
            style = 'border-red-400 bg-red-50 text-red-800'
          else if (answered && isRight) style = 'border-emerald-300 bg-emerald-50 text-emerald-700'

          return (
            <button
              key={opt.key}
              type="button"
              disabled={answered}
              onClick={() => setSelected(opt.key)}
              className={`w-full rounded-lg border-2 px-4 py-2.5 text-left text-sm font-medium transition-colors disabled:cursor-default ${style}`}
              aria-pressed={isSelected}
            >
              {opt.text}
            </button>
          )
        })}
      </div>

      {answered && (
        <div
          className={`mt-4 rounded-lg p-3 text-sm ${isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}
          role="status"
          aria-live="polite"
        >
          <p className="font-semibold">
            {isCorrect ? '✓ Great thinking!' : '↻ Not quite — keep reading and try again.'}
          </p>
          {explanation && <p className="mt-1 text-xs opacity-90">{explanation}</p>}
        </div>
      )}
    </div>
  )
}
