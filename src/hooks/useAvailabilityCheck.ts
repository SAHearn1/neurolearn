import { useState, useCallback } from 'react'
import {
  detectAvailability,
  type AvailabilityResult,
} from '../lib/raca/layer0-runtime/availability-detector'

/**
 * Tracks regulation level, turn count, and session duration.
 * Exposes helpers for the session lifecycle to gate agent invocations.
 * AI-08: Wire availability-detector into the session lifecycle.
 */
export function useAvailabilityCheck(sessionStartTime: number): {
  checkAvailability: () => AvailabilityResult
  recordTurn: () => void
  setRegulationLevel: (level: number) => void
  resetTurnCount: () => void
  currentAvailability: AvailabilityResult
} {
  const [regulationLevel, setRegulationLevelState] = useState(75)
  const [consecutiveAgentTurns, setConsecutiveAgentTurns] = useState(0)
  const [currentAvailability, setCurrentAvailability] = useState<AvailabilityResult>({
    state: 'available',
  })

  const checkAvailability = useCallback((): AvailabilityResult => {
    const sessionDurationMs = Date.now() - sessionStartTime
    const result = detectAvailability({
      regulationLevel,
      consecutiveAgentTurns,
      sessionDurationMs,
    })
    setCurrentAvailability(result)
    return result
  }, [regulationLevel, consecutiveAgentTurns, sessionStartTime])

  const recordTurn = useCallback(() => {
    setConsecutiveAgentTurns((n) => {
      const next = n + 1
      const sessionDurationMs = Date.now() - sessionStartTime
      const result = detectAvailability({
        regulationLevel,
        consecutiveAgentTurns: next,
        sessionDurationMs,
      })
      setCurrentAvailability(result)
      return next
    })
  }, [regulationLevel, sessionStartTime])

  const setRegulationLevel = useCallback(
    (level: number) => {
      setRegulationLevelState(level)
      const sessionDurationMs = Date.now() - sessionStartTime
      const result = detectAvailability({
        regulationLevel: level,
        consecutiveAgentTurns,
        sessionDurationMs,
      })
      setCurrentAvailability(result)
    },
    [consecutiveAgentTurns, sessionStartTime],
  )

  const resetTurnCount = useCallback(() => {
    setConsecutiveAgentTurns(0)
    const sessionDurationMs = Date.now() - sessionStartTime
    const result = detectAvailability({
      regulationLevel,
      consecutiveAgentTurns: 0,
      sessionDurationMs,
    })
    setCurrentAvailability(result)
  }, [regulationLevel, sessionStartTime])

  return {
    checkAvailability,
    recordTurn,
    setRegulationLevel,
    resetTurnCount,
    currentAvailability,
  }
}
