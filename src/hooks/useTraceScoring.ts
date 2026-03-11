// src/hooks/useTraceScoring.ts
// AI-03: TRACE Fluency Auto-Scorer hook
//
// Calls the `trace-score` edge function and exposes the result.

import { useState, useCallback } from 'react'
import { supabase } from '../../utils/supabase/client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TraceScores {
  think: number
  reason: number
  articulate: number
  check: number
  extend: number
  ethical: number
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTraceScoring() {
  const [scoring, setScoring] = useState(false)
  const [lastScores, setLastScores] = useState<TraceScores | null>(null)

  const scoreArtifact = useCallback(async (text: string, state: string): Promise<TraceScores> => {
    setScoring(true)
    try {
      const { data: sessionData, error: sessionErr } = await supabase.auth.getSession()
      if (sessionErr || !sessionData.session) {
        throw new Error('No active session — cannot call trace-score function')
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
      const fnUrl = `${supabaseUrl}/functions/v1/trace-score`

      // Use a stable sessionId derived from auth session for traceability
      const sessionId = sessionData.session.access_token.slice(-16)

      const res = await fetch(fnUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({
          artifactText: text,
          cognitiveState: state,
          sessionId,
        }),
      })

      if (!res.ok) {
        const errBody = await res.text()
        throw new Error(`trace-score function error ${res.status}: ${errBody}`)
      }

      const scores = (await res.json()) as TraceScores
      setLastScores(scores)
      return scores
    } finally {
      setScoring(false)
    }
  }, [])

  return { scoreArtifact, scoring, lastScores }
}
