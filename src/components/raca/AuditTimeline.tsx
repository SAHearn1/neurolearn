import type { RacaEvent } from '../../lib/raca/types/events'

interface Props {
  events: RacaEvent[]
  maxItems?: number
}

const KIND_COLORS: Record<string, string> = {
  session_started: 'bg-green-400',
  session_ended: 'bg-slate-400',
  state_transition: 'bg-brand-500',
  regulation_check: 'bg-blue-400',
  artifact_saved: 'bg-purple-400',
  agent_invoked: 'bg-amber-400',
  agent_responded: 'bg-amber-500',
  agent_blocked: 'bg-red-400',
  reflection_submitted: 'bg-teal-400',
  draft_submitted: 'bg-green-500',
  revision_submitted: 'bg-orange-400',
  defense_submitted: 'bg-red-500',
  dysregulation_detected: 'bg-rose-500',
  precondition_failed: 'bg-slate-300',
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return iso
  }
}

export function AuditTimeline({ events, maxItems = 20 }: Props) {
  const displayed = events.slice(-maxItems).reverse()

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-900">Session Timeline</h3>
      {displayed.length === 0 ? (
        <p className="text-xs text-slate-400">No events yet.</p>
      ) : (
        <div className="space-y-1">
          {displayed.map((event) => (
            <div key={event.id} className="flex items-start gap-2 text-xs">
              <div
                className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${KIND_COLORS[event.kind] ?? 'bg-slate-300'}`}
              />
              <div className="flex-1">
                <span className="font-medium text-slate-700">
                  {event.kind.replace(/_/g, ' ')}
                </span>
                {event.state_before && event.state_after && event.state_before !== event.state_after && (
                  <span className="ml-1 text-slate-500">
                    {event.state_before} &rarr; {event.state_after}
                  </span>
                )}
              </div>
              <span className="flex-shrink-0 text-slate-400">{formatTime(event.timestamp)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
