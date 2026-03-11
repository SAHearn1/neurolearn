// DATA-02: Live Classroom View component
// Responsive card grid of student session statuses with auto-refresh
// Issue #332: added lesson title, mastery score, 5Rs phase to student tiles

import { useClassroomRealtime } from '../../hooks/useClassroomRealtime'
import { Spinner } from '../ui/Spinner'

const FIVE_R_PILL: Record<string, string> = {
  Relate: 'bg-blue-100 text-blue-700',
  Regulate: 'bg-amber-100 text-amber-700',
  Reason: 'bg-brand-100 text-brand-700',
  Repair: 'bg-purple-100 text-purple-700',
  Restore: 'bg-green-100 text-green-700',
}

interface Props {
  studentIds: string[]
}

function statusDotColor(isActive: boolean, regulationLevel: number | null): string {
  if (!isActive) return 'bg-slate-300'
  if (regulationLevel === null) return 'bg-blue-400'
  if (regulationLevel >= 70) return 'bg-green-500'
  if (regulationLevel >= 40) return 'bg-yellow-400'
  return 'bg-red-500'
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export function LiveClassroomView({ studentIds }: Props) {
  const { statuses, loading } = useClassroomRealtime(studentIds)

  if (loading && statuses.length === 0) return <Spinner />

  if (studentIds.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
        <p className="text-sm text-slate-500">No students in your class yet.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Auto-refreshes via Realtime
          {loading && ' — updating…'}
        </p>
      </div>

      <ul
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Live classroom student statuses"
      >
        {statuses.map((status) => {
          const dotColor = statusDotColor(status.isActive, status.regulationLevel)
          const ariaLabel = `${status.displayName}: ${status.isActive ? 'active' : 'not active'}${
            status.regulationLevel !== null ? `, regulation ${status.regulationLevel}%` : ''
          }${status.currentState ? `, ${status.currentState}` : ''}`

          return (
            <li
              key={status.userId}
              className="rounded-xl border border-slate-200 bg-white p-4"
              aria-label={ariaLabel}
            >
              {/* Header */}
              <div className="mb-3 flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotColor}`}
                  aria-hidden="true"
                />
                <p className="truncate text-sm font-semibold text-slate-800">
                  {status.displayName}
                </p>
              </div>

              {/* Activity status */}
              <p className="text-xs text-slate-500">
                {status.isActive
                  ? 'Active now'
                  : status.lastActiveAt
                    ? `Last seen ${timeAgo(status.lastActiveAt)}`
                    : 'No recent activity'}
              </p>

              {/* Lesson context + 5Rs phase (#332) */}
              {status.isActive && (
                <div className="mt-1 space-y-1">
                  {status.lessonTitle && (
                    <p className="truncate text-xs text-slate-500" title={status.lessonTitle}>
                      {status.lessonTitle}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {status.currentState && (
                      <span className="text-xs font-medium text-brand-600">
                        {status.currentState}
                      </span>
                    )}
                    {status.fiveRPhase && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${FIVE_R_PILL[status.fiveRPhase] ?? 'bg-slate-100 text-slate-600'}`}
                      >
                        {status.fiveRPhase}
                      </span>
                    )}
                    {typeof status.masteryScore === 'number' && (
                      <span className="text-xs text-slate-400">
                        {Math.round(status.masteryScore * 100)}% mastery
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Regulation bar */}
              {status.regulationLevel !== null && (
                <div className="mt-2">
                  <div className="mb-0.5 flex items-center justify-between">
                    <span className="text-xs text-slate-400">Regulation</span>
                    <span className="text-xs font-semibold text-slate-600">
                      {status.regulationLevel}%
                    </span>
                  </div>
                  <div
                    className="h-1.5 overflow-hidden rounded-full bg-slate-100"
                    role="progressbar"
                    aria-label={`Regulation level: ${status.regulationLevel}%`}
                    aria-valuenow={status.regulationLevel}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className={`h-full rounded-full ${dotColor} transition-all duration-500`}
                      style={{ width: `${status.regulationLevel}%` }}
                    />
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
