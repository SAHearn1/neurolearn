import { useCallback } from 'react'
import { useRuntimeStore } from '../lib/raca/layer0-runtime/runtime-store'
import { appendAuditEvent } from '../lib/raca/layer0-runtime/audit-trail'
import { recordEvent } from '../lib/raca/layer0-runtime/session-manager'
import type { EventKind, EventSource } from '../lib/raca/types/events'

export function useAuditTrail() {
  const events = useRuntimeStore((s) => s.events)
  const sessionId = useRuntimeStore((s) => s.session_id)

  const record = useCallback(
    (kind: EventKind, source: EventSource, payload: Record<string, unknown> = {}) => {
      if (!sessionId) return

      // Record in runtime state
      recordEvent(kind, source, payload)

      // Also send to audit persistence
      const latestEvents = useRuntimeStore.getState().events
      const latest = latestEvents[latestEvents.length - 1]
      if (latest) {
        appendAuditEvent(latest)
      }
    },
    [sessionId],
  )

  return {
    events,
    record,
    eventCount: events.length,
  }
}
