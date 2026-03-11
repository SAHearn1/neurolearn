// UX-09 / Issue #325: Formative check-in at state transitions
// Brief comprehension confidence prompt shown at key RACA state transitions
// (distinct from RegulationCheckIn which captures emotional readiness).

import { useState } from 'react'
import { useSettingsStore } from '../../store/settingsStore'

export type ConfidenceLevel = 'confident' | 'unsure' | 'need_more_time'

interface Props {
  fromState: string
  toState: string
  onSelect: (level: ConfidenceLevel) => void
  onSkip: () => void
}

interface Option {
  level: ConfidenceLevel
  label: string
  emoji: string
  ariaLabel: string
  colorClasses: string
  selectedClasses: string
}

const OPTIONS: Option[] = [
  {
    level: 'confident',
    label: "I've got it",
    emoji: '✅',
    ariaLabel: 'I feel confident — ready to move on',
    colorClasses:
      'border-green-200 bg-green-50 text-green-800 hover:border-green-400 hover:bg-green-100 focus-visible:ring-green-400',
    selectedClasses: 'border-green-500 bg-green-100 ring-2 ring-green-400',
  },
  {
    level: 'unsure',
    label: 'A bit unsure',
    emoji: '🤔',
    ariaLabel: "I'm somewhat unsure — a quick review might help",
    colorClasses:
      'border-yellow-200 bg-yellow-50 text-yellow-800 hover:border-yellow-400 hover:bg-yellow-100 focus-visible:ring-yellow-400',
    selectedClasses: 'border-yellow-500 bg-yellow-100 ring-2 ring-yellow-400',
  },
  {
    level: 'need_more_time',
    label: 'Need more time',
    emoji: '⏳',
    ariaLabel: "I need more time — I'd like to revisit this step",
    colorClasses:
      'border-orange-200 bg-orange-50 text-orange-800 hover:border-orange-400 hover:bg-orange-100 focus-visible:ring-orange-400',
    selectedClasses: 'border-orange-500 bg-orange-100 ring-2 ring-orange-400',
  },
]

/** Human-readable label for a RACA state code */
function stateLabel(state: string): string {
  const map: Record<string, string> = {
    ROOT: 'Starting',
    REGULATE: 'Regulation',
    POSITION: 'Positioning',
    PLAN: 'Planning',
    APPLY: 'Applying',
    REVISE: 'Revising',
    DEFEND: 'Defending',
    RECONNECT: 'Reconnecting',
    ARCHIVE: 'Archiving',
  }
  return map[state] ?? state
}

export function FormativeCheckIn({ fromState, toState, onSelect, onSkip }: Props) {
  const dyslexiaFont = useSettingsStore((s) => s.accessibility.dyslexia_font)
  const [selected, setSelected] = useState<ConfidenceLevel | null>(null)

  function handleSelect(level: ConfidenceLevel) {
    setSelected(level)
    onSelect(level)
  }

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${dyslexiaFont ? 'font-dyslexia' : ''}`}
      aria-labelledby="formative-checkin-heading"
      role="dialog"
      aria-modal="true"
    >
      <div className="mb-1 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
          Quick check-in
        </p>
        <button
          type="button"
          onClick={onSkip}
          className="text-xs text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 rounded"
          aria-label="Skip this check-in"
        >
          Skip
        </button>
      </div>

      <h2 id="formative-checkin-heading" className="mb-1 text-base font-semibold text-slate-800">
        How confident do you feel about{' '}
        <span className="text-brand-700">{stateLabel(fromState)}</span>?
      </h2>
      <p className="mb-5 text-sm text-slate-500">
        Moving to <span className="font-medium">{stateLabel(toState)}</span> next.
      </p>

      <div role="group" aria-labelledby="formative-checkin-heading" className="flex flex-col gap-3">
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
                'flex cursor-pointer items-center gap-3 rounded-lg border-2 px-4 py-3',
                'text-left text-sm font-medium transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                isSelected ? option.selectedClasses : option.colorClasses,
              ].join(' ')}
            >
              <span aria-hidden="true" className="text-lg leading-none">
                {option.emoji}
              </span>
              <span>{option.label}</span>
            </button>
          )
        })}
      </div>

      {/* Supportive message for "need more time" */}
      <div role="status" aria-live="polite" aria-atomic="true" className="mt-4 min-h-[2rem]">
        {selected === 'need_more_time' && (
          <p className="rounded-md bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700">
            That&apos;s completely fine — take your time. You can revisit this step.
          </p>
        )}
      </div>
    </div>
  )
}
