import { supabase } from '../../../../utils/supabase/client'
import { racaFlags } from '../feature-flags'
import type { RacaEvent } from '../types/events'

/**
 * Audit Trail — persists RACA events to Supabase when the audit flag is on.
 * Falls back to console logging when persistence is disabled.
 */

const BATCH_SIZE = 20
const FLUSH_INTERVAL_MS = 5000

let buffer: RacaEvent[] = []
let flushTimer: ReturnType<typeof setInterval> | null = null

export function appendAuditEvent(event: RacaEvent): void {
  if (!racaFlags.auditPersistence) {
    if (import.meta.env.DEV) {
      console.debug('[RACA Audit]', event.kind, event.payload)
    }
    return
  }

  buffer.push(event)

  if (buffer.length >= BATCH_SIZE) {
    flushAuditBuffer()
  }

  if (!flushTimer) {
    flushTimer = setInterval(flushAuditBuffer, FLUSH_INTERVAL_MS)
  }
}

export async function flushAuditBuffer(): Promise<void> {
  if (buffer.length === 0) return

  const batch = [...buffer]
  buffer = []

  try {
    const { error } = await supabase.from('raca_audit_events').insert(
      batch.map((e) => ({
        id: e.id,
        session_id: e.session_id,
        kind: e.kind,
        source: e.source,
        state_before: e.state_before,
        state_after: e.state_after,
        payload: e.payload,
        created_at: e.timestamp,
      })),
    )

    if (error) {
      console.error('[RACA Audit] Flush failed:', error.message)
      // Re-add failed events to front of buffer for retry
      buffer = [...batch, ...buffer]
    }
  } catch (err) {
    console.error('[RACA Audit] Flush error:', err)
    buffer = [...batch, ...buffer]
  }
}

export function stopAuditFlush(): void {
  if (flushTimer) {
    clearInterval(flushTimer)
    flushTimer = null
  }
}
