import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useAuthStore } from '../store/authStore'
import {
  buildLongitudinalContext,
  summarizeMemoryBrief,
} from '../lib/intelligence/longitudinal-context'
import type { LongitudinalContext } from '../lib/intelligence/longitudinal-context'

/**
 * AI-09: Cross-Session Memory Brief Hook
 * Provides longitudinal context for agent personalisation.
 */
export function useLongitudinalContext(): {
  context: LongitudinalContext | null
  memoryBrief: string
  loading: boolean
  refresh: () => void
} {
  const user = useAuthStore((s) => s.user)
  const [context, setContext] = useState<LongitudinalContext | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const ctx = await buildLongitudinalContext(supabase, user.id)
      setContext(ctx)
    } catch {
      setContext(null)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    refresh()
  }, [refresh])

  const memoryBrief = context ? summarizeMemoryBrief(context) : ''

  return { context, memoryBrief, loading, refresh }
}
