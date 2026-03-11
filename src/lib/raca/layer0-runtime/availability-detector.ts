/**
 * Availability Detector — detects learner cognitive availability based on session context.
 * AI-08: Wire availability-detector into the session lifecycle.
 *
 * Note: dysregulation signal detection lives in layer4-epistemic/availability-detector.ts.
 * This module handles the higher-level availability state used to gate session continuation.
 */

export type AvailabilityState = 'available' | 'limited' | 'unavailable'

export interface AvailabilityResult {
  state: AvailabilityState
  reason?: string
}

/**
 * Checks learner cognitive availability based on:
 * - regulationLevel (0-100): from regulation check-in
 * - consecutiveAgentTurns: how many turns without a break
 * - sessionDurationMs: total session time so far
 */
export function detectAvailability(params: {
  regulationLevel: number // 0-100; 0=struggling, 100=ready
  consecutiveAgentTurns: number // resets on break/pause
  sessionDurationMs: number
}): AvailabilityResult {
  if (params.regulationLevel < 30) {
    return {
      state: 'unavailable',
      reason: 'You seem to be having a hard time right now.',
    }
  }

  if (
    params.regulationLevel < 50 ||
    params.consecutiveAgentTurns > 10 ||
    params.sessionDurationMs > 45 * 60 * 1000
  ) {
    return {
      state: 'limited',
      reason: 'A short break might help you think more clearly.',
    }
  }

  return { state: 'available' }
}
