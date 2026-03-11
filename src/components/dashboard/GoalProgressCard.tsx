import { Link } from 'react-router-dom'
import type { StudentGoal } from '../../hooks/useStudentGoals'

interface GoalProgressCardProps {
  goal: StudentGoal
  sessionCount: number
}

const GOAL_TYPE_LABELS: Record<StudentGoal['goalType'], string> = {
  open: 'Open',
  skill: 'Skill',
  exam: 'Exam prep',
  curiosity: 'Curiosity',
}

const SESSIONS_TO_COMPLETE = 5

function daysSince(dateStr: string): number {
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

/**
 * AGY-01: Goal Progress Card
 * Displays progress toward the learner's active learning goal.
 */
export function GoalProgressCard({ goal, sessionCount }: GoalProgressCardProps) {
  const progressPercent = Math.min((sessionCount / SESSIONS_TO_COMPLETE) * 100, 100)
  const days = daysSince(goal.createdAt)

  if (goal.achieved) {
    return (
      <div
        className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm"
        aria-label="Goal achieved"
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-green-800">{goal.goalText}</p>
          <span className="shrink-0 rounded-full border border-green-300 bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
            {GOAL_TYPE_LABELS[goal.goalType]}
          </span>
        </div>
        <p className="mt-2 text-sm font-semibold text-green-700">Goal achieved! 🎉</p>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      aria-label={`Goal progress: ${goal.goalText}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-800">{goal.goalText}</p>
        <span className="shrink-0 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
          {GOAL_TYPE_LABELS[goal.goalType]}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
        <span>{days === 0 ? 'Set today' : days === 1 ? '1 day ago' : `${days} days ago`}</span>
        <span aria-hidden="true">·</span>
        <span>
          {sessionCount} of {SESSIONS_TO_COMPLETE} sessions
        </span>
      </div>

      <div className="mt-3">
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-valuenow={sessionCount}
          aria-valuemin={0}
          aria-valuemax={SESSIONS_TO_COMPLETE}
          aria-label={`${sessionCount} of ${SESSIONS_TO_COMPLETE} sessions toward your goal`}
        >
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="mt-3">
        <Link
          to="/courses"
          className="text-xs font-medium text-brand-600 hover:text-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
        >
          Continue working toward your goal →
        </Link>
      </div>
    </div>
  )
}
