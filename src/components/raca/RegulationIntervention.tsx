import { useState } from 'react'
import { Button } from '../ui/Button'
import { getActivityForLevel, REGULATION_BANDS } from '../../lib/raca/regulation-content'

interface Props {
  regulationLevel: number
  onDismiss: () => void
}

const ACTIVITY_TYPE_ICON: Record<string, string> = {
  breathing: '🌬️',
  grounding: '🌿',
  movement: '🤸',
  cognitive: '💭',
}

function getBandLabel(level: number): { title: string; subtitle: string; color: string } {
  if (level < REGULATION_BANDS.CRITICAL.max + 1) {
    return {
      title: 'Take a real break',
      subtitle: 'Your brain needs time to reset. That is okay — learning is hard.',
      color: 'bg-red-50 border-red-200',
    }
  }
  if (level < REGULATION_BANDS.LOW.max + 1) {
    return {
      title: 'Take a moment',
      subtitle: 'Things are getting challenging. A brief reset will help.',
      color: 'bg-amber-50 border-amber-200',
    }
  }
  return {
    title: 'Quick check-in',
    subtitle: 'A brief pause before continuing.',
    color: 'bg-blue-50 border-blue-200',
  }
}

/**
 * REQ-18-06 — Regulation Intervention overlay.
 * Surfaces a co-regulation micro-activity from the content library
 * appropriate to the learner's current regulation level.
 * Learner can swap for a different activity type if needed.
 */
export function RegulationIntervention({ regulationLevel, onDismiss }: Props) {
  const [activity, setActivity] = useState(() => getActivityForLevel(regulationLevel))

  const swap = () => {
    setActivity((current) => getActivityForLevel(regulationLevel, current.title))
  }

  const { title, subtitle, color } = getBandLabel(regulationLevel)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        {/* Header */}
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl">
            {ACTIVITY_TYPE_ICON[activity.type] ?? '🌱'}
          </div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>

        {/* Activity card */}
        <div className={`rounded-xl border p-4 ${color}`}>
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-600 capitalize border border-slate-200">
              {activity.type}
            </span>
            <span className="text-xs text-slate-400">
              ~{Math.ceil(activity.durationSeconds / 60)} min
            </span>
          </div>
          <p className="mb-1 font-semibold text-slate-900">{activity.title}</p>
          <p className="text-sm text-slate-700 leading-relaxed">{activity.instruction}</p>
        </div>

        {/* Actions */}
        <div className="mt-5 space-y-2">
          <Button onClick={onDismiss} className="w-full">
            I am ready to continue
          </Button>
          <button
            type="button"
            onClick={swap}
            className="w-full rounded-lg py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Try a different activity →
          </button>
        </div>

        <p className="mt-3 text-center text-xs text-slate-400">
          Regulation level: {regulationLevel}/100
        </p>
      </div>
    </div>
  )
}
