import { useState } from 'react'
import { useSettingsStore } from '../../store/settingsStore'

type SelectableMode = 'review' | 'standard' | 'challenge'

interface SessionModeSelectorProps {
  onSelect: (mode: SelectableMode) => void
  currentMode?: string
}

interface ModeCard {
  mode: SelectableMode
  icon: string
  title: string
  description: string
}

const MODES: ModeCard[] = [
  {
    mode: 'review',
    icon: '🔄',
    title: 'Review & Consolidate',
    description: 'Revisit what you already know. Lower pressure, focus on reinforcement.',
  },
  {
    mode: 'standard',
    icon: '📚',
    title: 'Standard Session',
    description: 'The full learning journey from grounding to insight.',
  },
  {
    mode: 'challenge',
    icon: '⚡',
    title: 'Challenge Mode',
    description: "Skip warm-up and go deep. Best when you're feeling sharp.",
  },
]

/**
 * AGY-02: Session Mode Selector
 * Lets learners choose their session mode before starting a session.
 */
export function SessionModeSelector({ onSelect, currentMode }: SessionModeSelectorProps) {
  const reduceMotion = useSettingsStore((s) => s.accessibility.reduce_motion)
  const [selected, setSelected] = useState<SelectableMode>(
    (currentMode as SelectableMode | undefined) ?? 'standard',
  )

  const handleStart = () => {
    onSelect(selected)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-slate-800">How do you want to learn today?</h2>

      <div
        className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        role="group"
        aria-label="Session mode options"
      >
        {MODES.map(({ mode, icon, title, description }) => {
          const isSelected = selected === mode
          const descId = `mode-desc-${mode}`

          return (
            <button
              key={mode}
              type="button"
              aria-pressed={isSelected}
              aria-describedby={descId}
              onClick={() => setSelected(mode)}
              className={`rounded-xl border p-4 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 ${
                reduceMotion ? '' : 'transition-all duration-150'
              } ${
                isSelected
                  ? 'border-brand-500 bg-brand-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className="text-xl">
                  {icon}
                </span>
                <span className="text-sm font-semibold text-slate-800">{title}</span>
              </div>
              <p id={descId} className="mt-1.5 text-xs leading-relaxed text-slate-500">
                {description}
              </p>
            </button>
          )
        })}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          aria-label={`Start ${selected} session`}
          onClick={handleStart}
          className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
        >
          Start session →
        </button>
      </div>
    </div>
  )
}
