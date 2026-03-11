import { useCallback } from 'react'
import { useRuntimeStore } from '../lib/raca/layer0-runtime/runtime-store'
import { startSession, endSession } from '../lib/raca/layer0-runtime/session-manager'
import {
  saveSessionLocal,
  saveSessionRemote,
  clearSessionLocal,
} from '../lib/raca/layer0-runtime/persistence'
import { flushAuditBuffer, stopAuditFlush } from '../lib/raca/layer0-runtime/audit-trail'
import { racaFlags } from '../lib/raca/feature-flags'
import { useAuthStore } from '../store/authStore'
import type { SessionConfig } from '../lib/raca/types/session'

export function useRacaSession() {
  const user = useAuthStore((s) => s.user)
  const sessionId = useRuntimeStore((s) => s.session_id)
  const status = useRuntimeStore((s) => s.status)
  const currentState = useRuntimeStore((s) => s.current_state)
  const stateHistory = useRuntimeStore((s) => s.state_history)
  const regulation = useRuntimeStore((s) => s.regulation)
  const artifacts = useRuntimeStore((s) => s.artifacts)
  const events = useRuntimeStore((s) => s.events)

  const userId = user?.id
  const start = useCallback(
    async (config: SessionConfig) => {
      if (!userId) return null
      const id = startSession(userId, config)
      if (racaFlags.auditPersistence) {
        // cognitive_sessions row must exist in DB before the audit flush timer
        // fires, otherwise the RLS subquery finds no matching session and
        // rejects every INSERT into raca_audit_events.
        await saveSessionRemote()
      }
      return id
    },
    [userId],
  )

  const end = useCallback(async (abandoned = false) => {
    endSession(abandoned ? 'abandoned' : 'completed')
    if (racaFlags.auditPersistence) {
      // Persist the session row first so audit events can pass RLS validation.
      await saveSessionRemote()
    }
    await flushAuditBuffer()
    stopAuditFlush()
    clearSessionLocal()
  }, [])

  const save = useCallback(async () => {
    saveSessionLocal()
    if (racaFlags.auditPersistence) {
      await saveSessionRemote()
    }
  }, [])

  return {
    sessionId,
    status,
    currentState,
    stateHistory,
    regulation,
    artifacts,
    events,
    isActive: status === 'active',
    start,
    end,
    save,
  }
}
