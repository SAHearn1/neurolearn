// EDU-14: Educator Alerts Panel
// Shows active intervention alerts with mark-read and dismiss actions

import { useEducatorAlerts } from '../../hooks/useEducatorAlerts'
import { Spinner } from '../ui/Spinner'

const ALERT_TYPE_META: Record<string, { label: string; badgeClass: string }> = {
  low_regulation: {
    label: 'Low Regulation',
    badgeClass: 'bg-yellow-100 text-yellow-800',
  },
  no_activity: {
    label: 'No Activity',
    badgeClass: 'bg-slate-100 text-slate-700',
  },
  mastery_plateau: {
    label: 'Mastery Plateau',
    badgeClass: 'bg-orange-100 text-orange-800',
  },
  frustration_spike: {
    label: 'Frustration Spike',
    badgeClass: 'bg-red-100 text-red-800',
  },
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function AlertsPanel() {
  const { alerts, markRead, dismiss, loading } = useEducatorAlerts()

  if (loading) return <Spinner />

  if (alerts.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
        <p className="text-sm text-slate-500">No alerts — your students are on track!</p>
      </div>
    )
  }

  return (
    <div aria-live="polite" aria-label="Educator alerts" className="space-y-2">
      {alerts.map((alert) => {
        const meta = ALERT_TYPE_META[alert.alertType] ?? {
          label: alert.alertType,
          badgeClass: 'bg-slate-100 text-slate-700',
        }
        const isUnread = alert.readAt === null

        return (
          <div
            key={alert.id}
            className={`rounded-xl border p-4 ${
              isUnread ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              {/* Left: badge + message */}
              <div className="min-w-0 flex-1 space-y-1">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${meta.badgeClass}`}
                >
                  {meta.label}
                </span>
                <p className="text-sm text-slate-700">{alert.message}</p>
                <p className="text-xs text-slate-400">{timeAgo(alert.createdAt)}</p>
              </div>

              {/* Right: actions */}
              <div className="flex shrink-0 items-center gap-2">
                {isUnread && (
                  <button
                    onClick={() => markRead(alert.id)}
                    aria-label={`Mark alert as read: ${alert.message}`}
                    className="rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                  >
                    Mark read
                  </button>
                )}
                <button
                  onClick={() => dismiss(alert.id)}
                  aria-label={`Dismiss alert: ${alert.message}`}
                  className="rounded px-2 py-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
