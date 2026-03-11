import { useState } from 'react'
import { useStudentGoals } from '../../hooks/useStudentGoals'
import type { StudentGoal } from '../../hooks/useStudentGoals'

interface GoalSettingWidgetProps {
  onGoalSaved?: () => void
}

const GOAL_TYPES: { value: StudentGoal['goalType']; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'skill', label: 'Skill' },
  { value: 'exam', label: 'Exam prep' },
  { value: 'curiosity', label: 'Curiosity' },
]

/**
 * AGY-01: Goal Setting Widget
 * Lets learners set a personal learning goal for the week.
 */
export function GoalSettingWidget({ onGoalSaved }: GoalSettingWidgetProps) {
  const { activeGoal, addGoal, markAchieved, loading } = useStudentGoals()
  const [text, setText] = useState('')
  const [selectedType, setSelectedType] = useState<StudentGoal['goalType']>('open')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const charCount = text.length
  const MAX_CHARS = 280

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || saving) return

    setSaving(true)
    try {
      await addGoal(text.trim(), selectedType)
      setText('')
      setSelectedType('open')
      setEditing(false)
      onGoalSaved?.()
    } finally {
      setSaving(false)
    }
  }

  const handleMarkAchieved = async () => {
    if (!activeGoal) return
    await markAchieved(activeGoal.id)
  }

  if (loading) {
    return (
      <div
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        aria-busy="true"
        aria-label="Loading your learning goal"
      >
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
      </div>
    )
  }

  // Active goal exists and not in edit mode
  if (activeGoal && !editing) {
    return (
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 shadow-sm">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-600">
          This week's goal
        </p>
        <p className="text-sm font-medium text-slate-800">{activeGoal.goalText}</p>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            aria-label="Edit your learning goal"
            onClick={() => {
              setText(activeGoal.goalText)
              setSelectedType(activeGoal.goalType)
              setEditing(true)
            }}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
          >
            ✏️ Update
          </button>
          <button
            type="button"
            aria-label="Mark your goal as achieved"
            onClick={handleMarkAchieved}
            className="rounded-lg border border-green-300 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
          >
            ✅ Mark achieved
          </button>
        </div>
      </div>
    )
  }

  // No active goal or in edit mode — show the form
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-sm font-medium text-slate-700">
        What do you want to learn or achieve this week?
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="goal-text" className="sr-only">
            Learning goal (max 280 characters)
          </label>
          <textarea
            id="goal-text"
            aria-label="Describe your learning goal in up to 280 characters"
            className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            rows={3}
            maxLength={MAX_CHARS}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. Understand how photosynthesis works well enough to explain it to a friend"
          />
          <p className="text-right text-xs text-slate-400" aria-live="polite">
            {charCount}/{MAX_CHARS}
          </p>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Goal type">
          {GOAL_TYPES.map((gt) => (
            <button
              key={gt.value}
              type="button"
              aria-pressed={selectedType === gt.value}
              onClick={() => setSelectedType(gt.value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 ${
                selectedType === gt.value
                  ? 'border-brand-500 bg-brand-500 text-white'
                  : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {gt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            aria-label="Save your learning goal"
            disabled={!text.trim() || saving}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Set my goal'}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
