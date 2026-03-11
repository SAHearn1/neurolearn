// ADM-03: Platform thresholds hook

import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase/client'

interface ThresholdRow {
  threshold_key: string
  threshold_value: number
}

export interface PlatformThreshold {
  key: string
  value: number
}

export function usePlatformThresholds(): {
  thresholds: PlatformThreshold[]
  updateThreshold: (key: string, value: number) => Promise<void>
  loading: boolean
} {
  const [thresholds, setThresholds] = useState<PlatformThreshold[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from('platform_thresholds')
        .select('threshold_key, threshold_value')

      if (cancelled) return

      if (error || !data) {
        setLoading(false)
        return
      }

      setThresholds(
        (data as ThresholdRow[]).map((row) => ({
          key: row.threshold_key,
          value: row.threshold_value,
        })),
      )
      setLoading(false)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  const updateThreshold = async (key: string, value: number) => {
    setLoading(true)
    await supabase
      .from('platform_thresholds')
      .update({ threshold_value: value })
      .eq('threshold_key', key)
    setThresholds((prev) => prev.map((t) => (t.key === key ? { ...t, value } : t)))
    setLoading(false)
  }

  return { thresholds, updateThreshold, loading }
}
