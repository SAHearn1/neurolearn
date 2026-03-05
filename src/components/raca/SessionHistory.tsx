import { useSessionHistory } from '../../hooks/useSessionHistory'
import { Spinner } from '../ui/Spinner'

const STATE_EMOJI: Record<string, string> = {
  ROOT: '🌱',
  REGULATE: '💙',
  POSITION: '🎯',
  PLAN: '📋',
  APPLY: '✏️',
  REVISE: '🔄',
  DEFEND: '🛡️',
  RECONNECT: '🔗',
  ARCHIVE: '✅',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDuration(start: string, end: string | null): string {
  if (!end) return '—'
  const ms = new Date(end).getTime() - new Date(start).getTime()
  const mins = Math.round(ms / 60_000)
  if (mins < 60) return `${mins} min`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

/**
 * REQ-18-03 — Session History timeline for the learner Profile page.
 * Shows completed RACA sessions with date, duration, state count, artifact count.
 */
export function SessionHistory() {
  const { sessions, loading } = useSessionHistory(15)

  if (loading) return <Spinner />

  if (sessions.length === 0) {
    return (
      <p className="text-center text-sm text-slate-400 py-4">
        Complete a deep learning session to start building your session history.
      </p>
    )
  }

  return (
    <ol className="relative border-l border-slate-200 space-y-0 pl-6">
      {sessions.map((session, i) => {
        const emoji = STATE_EMOJI[session.current_state] ?? '📌'
        return (
          <li key={session.id} className={`pb-6 ${i === sessions.length - 1 ? '' : ''}`}>
            {/* Timeline dot */}
            <span className="absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-white ring-2 ring-slate-200 text-xs">
              {emoji}
            </span>

            <div className="ml-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">
                  {formatDate(session.started_at)}
                </p>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500 border border-slate-200">
                  {formatDuration(session.started_at, session.completed_at)}
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-slate-500">
                <span>
                  <strong className="text-slate-700">{session.state_count}</strong> states visited
                </span>
                <span>
                  <strong className="text-slate-700">{session.artifact_count}</strong> artifacts
                </span>
                <span>
                  Ended at <strong className="text-slate-700">{session.current_state}</strong>
                </span>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
