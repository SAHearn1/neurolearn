import { useEffect, useRef } from 'react'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../../utils/supabase/client'
import { createLogger } from '../lib/logger'

const log = createLogger('session')

const REFRESH_THRESHOLD_MS = 5 * 60 * 1000 // 5 minutes before expiry

export function useSessionManager() {
  const { session, initialized } = useAuthStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!initialized || !session) return

    function scheduleRefresh() {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      const expiresAt = session!.expires_at
      if (!expiresAt) return

      const expiresMs = expiresAt * 1000
      const refreshAt = expiresMs - REFRESH_THRESHOLD_MS - Date.now()

      if (refreshAt <= 0) {
        log.info('Session near expiry, refreshing now')
        supabase.auth.refreshSession().catch((err) => {
          log.error('Session refresh failed', err)
        })
        return
      }

      log.debug(`Scheduling session refresh in ${Math.round(refreshAt / 1000)}s`)
      timerRef.current = setTimeout(() => {
        log.info('Refreshing session token')
        supabase.auth.refreshSession().catch((err) => {
          log.error('Session refresh failed', err)
        })
      }, refreshAt)
    }

    scheduleRefresh()

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [session, initialized])

  return { session, initialized }
}
