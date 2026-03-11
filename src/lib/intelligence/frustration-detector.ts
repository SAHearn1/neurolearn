// src/lib/intelligence/frustration-detector.ts
// AI-03: TRACE Fluency Auto-Scorer — Frustration Detector
//
// Monitors three behavioural signals during a RACA session and emits a
// frustration event when 2 or more signals are simultaneously active.
// Respects a 5-minute cooldown between consecutive emissions.

export interface FrustrationSignal {
  sessionId: string
  signals: string[]
  timestamp: number
}

interface FrustrationDetectorOptions {
  onFrustration: (signal: FrustrationSignal) => void
  sessionId: string
}

// Signal thresholds
const IDLE_THRESHOLD_MS = 90_000 // 1.5 minutes
const DELETE_RATIO_THRESHOLD = 0.6
const DELETE_RATIO_MIN_KEYSTROKES = 30
const ATTEMPT_COUNT_THRESHOLD = 3
const COOLDOWN_MS = 5 * 60 * 1000 // 5 minutes

export class FrustrationDetector {
  private readonly sessionId: string
  private readonly onFrustration: (signal: FrustrationSignal) => void

  // Signal state
  private idleActive = false
  private deleteRatioActive = false
  private attemptCountActive = false

  // Tracking state
  private keystrokeCount = 0
  private deleteCount = 0
  private lastEmittedAt = 0

  constructor({ onFrustration, sessionId }: FrustrationDetectorOptions) {
    this.sessionId = sessionId
    this.onFrustration = onFrustration
  }

  /**
   * Called with the number of milliseconds since the user's last keystroke.
   * Sets the idle signal if idle > 90 000 ms.
   */
  recordIdle(ms: number): void {
    const wasActive = this.idleActive
    this.idleActive = ms > IDLE_THRESHOLD_MS
    if (this.idleActive !== wasActive) {
      this.evaluate()
    }
  }

  /**
   * Called with the fraction of keystrokes that are deletes (0–1).
   * Tracks cumulative keystrokes to ensure at least 30 before activating.
   *
   * @param ratio - fraction of total keystrokes that are deletions
   */
  recordDeleteRatio(ratio: number): void {
    // Infer keystroke counts from ratio. Callers may also call this after
    // each keystroke; we accumulate totals internally.
    this.keystrokeCount++
    if (ratio > 0) {
      this.deleteCount = Math.round(ratio * this.keystrokeCount)
    }

    const currentRatio = this.keystrokeCount > 0 ? this.deleteCount / this.keystrokeCount : 0
    const wasActive = this.deleteRatioActive
    this.deleteRatioActive =
      this.keystrokeCount >= DELETE_RATIO_MIN_KEYSTROKES && currentRatio > DELETE_RATIO_THRESHOLD

    if (this.deleteRatioActive !== wasActive) {
      this.evaluate()
    }
  }

  /**
   * Called with the number of times the user has re-submitted the same
   * cognitive state without advancing (e.g., re-sending to the same agent).
   * Sets the attempt-count signal at >= 3 attempts.
   */
  recordAttemptCount(count: number): void {
    const wasActive = this.attemptCountActive
    this.attemptCountActive = count >= ATTEMPT_COUNT_THRESHOLD
    if (this.attemptCountActive !== wasActive) {
      this.evaluate()
    }
  }

  /** Returns the names of currently active signals. */
  get activeSignals(): string[] {
    const signals: string[] = []
    if (this.idleActive) signals.push('idle')
    if (this.deleteRatioActive) signals.push('delete_ratio')
    if (this.attemptCountActive) signals.push('attempt_count')
    return signals
  }

  /** Resets all signal state (e.g., when the user advances to a new state). */
  reset(): void {
    this.idleActive = false
    this.deleteRatioActive = false
    this.attemptCountActive = false
    this.keystrokeCount = 0
    this.deleteCount = 0
  }

  private evaluate(): void {
    const signals = this.activeSignals
    if (signals.length < 2) return

    const now = Date.now()
    if (now - this.lastEmittedAt < COOLDOWN_MS) return

    this.lastEmittedAt = now
    this.onFrustration({ sessionId: this.sessionId, signals, timestamp: now })
  }
}
