// src/components/raca/RegulationCheckIn.tsx
// AI-03: TRACE Fluency Auto-Scorer — Pre-session regulation check-in widget
//
// Shown before a RACA session starts so the learner can signal their
// current emotional/cognitive readiness.

import { useState } from 'react'
import { useSettingsStore } from '../../store/settingsStore'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RegulationLevel = 'ready' | 'distracted' | 'struggling'

interface RegulationOption {
  level: RegulationLevel
  label: string
  emoji: string
  ariaLabel: string
  colorClasses: string
  selectedClasses: string
}

interface Props {
  onSelect: (level: RegulationLevel) => void
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OPTIONS: RegulationOption[] = [
  {
    level: 'ready',
    label: 'Ready to focus',
    emoji: '🟢',
    ariaLabel: 'Ready to focus — I feel calm and prepared',
    colorClasses:
      'border-green-200 bg-green-50 text-green-800 hover:border-green-400 hover:bg-green-100 focus-visible:ring-green-400',
    selectedClasses: 'border-green-500 bg-green-100 ring-2 ring-green-400',
  },
  {
    level: 'distracted',
    label: 'A bit distracted',
    emoji: '🟡',
    ariaLabel: 'A bit distracted — my mind is partly elsewhere',
    colorClasses:
      'border-yellow-200 bg-yellow-50 text-yellow-800 hover:border-yellow-400 hover:bg-yellow-100 focus-visible:ring-yellow-400',
    selectedClasses: 'border-yellow-500 bg-yellow-100 ring-2 ring-yellow-400',
  },
  {
    level: 'struggling',
    label: 'Really struggling',
    emoji: '🔴',
    ariaLabel: 'Really struggling — I need support before I begin',
    colorClasses:
      'border-red-200 bg-red-50 text-red-800 hover:border-red-400 hover:bg-red-100 focus-visible:ring-red-400',
    selectedClasses: 'border-red-500 bg-red-100 ring-2 ring-red-400',
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RegulationCheckIn({ onSelect }: Props) {
  const dyslexiaFont = useSettingsStore((s) => s.accessibility.dyslexia_font)
  const [selected, setSelected] = useState<RegulationLevel | null>(null)

  const fontClass = dyslexiaFont ? 'font-dyslexia' : ''

  function handleSelect(level: RegulationLevel) {
    setSelected(level)
    onSelect(level)
  }

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${fontClass}`}
      aria-labelledby="regulation-checkin-heading"
    >
      <h2 id="regulation-checkin-heading" className="mb-2 text-lg font-semibold text-slate-800">
        How are you feeling right now?
      </h2>
      <p className="mb-5 text-sm text-slate-500">
        Check in with yourself before we begin. There is no wrong answer.
      </p>

      <div
        role="group"
        aria-labelledby="regulation-checkin-heading"
        className="flex flex-col gap-3 sm:flex-row"
      >
        {OPTIONS.map((option) => {
          const isSelected = selected === option.level
          return (
            <button
              key={option.level}
              type="button"
              aria-label={option.ariaLabel}
              aria-pressed={isSelected}
              onClick={() => handleSelect(option.level)}
              className={[
                'flex flex-1 cursor-pointer items-center gap-3 rounded-lg border-2 px-4 py-3',
                'text-left text-sm font-medium transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                isSelected ? option.selectedClasses : option.colorClasses,
              ].join(' ')}
            >
              <span aria-hidden="true" className="text-xl leading-none">
                {option.emoji}
              </span>
              <span>{option.label}</span>
            </button>
          )
        })}
      </div>

      {/* Gentle message shown when "struggling" is selected */}
      <div role="status" aria-live="polite" aria-atomic="true" className="mt-4 min-h-[2rem]">
        {selected === 'struggling' && (
          <p className="rounded-md bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
            That&apos;s okay — let&apos;s take a breath first
          </p>
        )}
      </div>
    </div>
  )
}
