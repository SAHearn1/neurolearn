import type { DysregulationSignal, RegulationState } from '../types/epistemic'

/**
 * Availability Detector — detects dysregulation signals from learner behavior.
 * Multi-channel signal analysis: text patterns, timing, response length, abandonment.
 */

const NEGATIVE_SELF_TALK = [
  /\bI(?:'m| am) (?:stupid|dumb|an idiot)\b/i,
  /\bI can(?:'t| not) do (?:this|anything)\b/i,
  /\bI(?:'m| am) (?:so |too )?(?:bad|terrible|hopeless)\b/i,
  /\bI(?:'ll| will) never (?:get|understand|learn)\b/i,
  /\bwhat(?:'s| is) (?:the |even the )?point\b/i,
]

const AVOIDANCE_PATTERNS = [
  /^(?:idk|idc|whatever|fine|ok|sure|nm|nvm)\.?$/i,
  /\bI don(?:'t| not) (?:want|care|know)\b/i,
  /\bjust (?:skip|stop|quit|leave)\b/i,
  /\bthis is (?:boring|pointless|waste)\b/i,
]

export function detectDysregulationSignals(
  message: string,
  recentMessages: Array<{ text: string; timestamp: string }>,
): DysregulationSignal[] {
  const signals: DysregulationSignal[] = []

  // Negative self-talk
  for (const pattern of NEGATIVE_SELF_TALK) {
    if (pattern.test(message)) {
      signals.push({
        type: 'negative_self_talk',
        severity: 2,
        detail: `Matched: ${pattern.source}`,
      })
      break
    }
  }

  // Avoidance patterns
  for (const pattern of AVOIDANCE_PATTERNS) {
    if (pattern.test(message)) {
      signals.push({
        type: 'avoidance',
        severity: 2,
        detail: `Matched: ${pattern.source}`,
      })
      break
    }
  }

  // ALL CAPS detection (3+ words or >50% uppercase)
  const words = message.trim().split(/\s+/)
  const capsWords = words.filter((w) => w === w.toUpperCase() && w.length > 1)
  if (capsWords.length >= 3 || (words.length > 2 && capsWords.length / words.length > 0.5)) {
    signals.push({
      type: 'all_caps',
      severity: 1,
      detail: `${capsWords.length}/${words.length} words in ALL CAPS`,
    })
  }

  // Excessive punctuation
  const excessivePunctuation = /[!?]{3,}/.test(message)
  if (excessivePunctuation) {
    signals.push({
      type: 'excessive_punctuation',
      severity: 1,
      detail: 'Excessive punctuation detected',
    })
  }

  // Rapid short responses (3+ messages under 10 chars in last 5 messages)
  const recentShort = recentMessages.slice(-5).filter((m) => m.text.length < 10)
  if (recentShort.length >= 3) {
    signals.push({
      type: 'rapid_short_responses',
      severity: 2,
      detail: `${recentShort.length} short responses in last 5 messages`,
    })
  }

  // Rapid timing (3+ messages within 30 seconds)
  if (recentMessages.length >= 3) {
    const last3 = recentMessages.slice(-3)
    const first = new Date(last3[0].timestamp).getTime()
    const last = new Date(last3[last3.length - 1].timestamp).getTime()
    if (last - first < 30_000) {
      signals.push({
        type: 'rapid_timing',
        severity: 2,
        detail: `${last3.length} messages in ${Math.round((last - first) / 1000)}s`,
      })
    }
  }

  return signals
}

export function computeRegulationDelta(signals: DysregulationSignal[]): number {
  return signals.reduce((delta, s) => delta - s.severity * 5, 0)
}

export function shouldTriggerIntervention(regulation: RegulationState): boolean {
  return regulation.level < 40 || regulation.signals.length >= 3
}
