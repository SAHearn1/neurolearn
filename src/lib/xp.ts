/**
 * XP & Level system — rewards are tied to observable learning behaviors,
 * not AI output. Aligns with RWLE principle: epistemic fluency is earned
 * through doing, not receiving.
 */

export const XP_PER_LESSON = 10
export const XP_PER_STREAK_DAY = 5

// ── RACA session XP — REQ-18-01 ───────────────────────────────────────────
// XP_PER_TRACE_CYCLE: base award for completing a full RACA session (ROOT → ARCHIVE).
// Renamed alias retained for backward compatibility.
export const XP_PER_TRACE_CYCLE = 25
/** @deprecated use XP_PER_TRACE_CYCLE — TODO: remove in v1.0 */
export const XP_PER_RACA_SESSION_BASE = XP_PER_TRACE_CYCLE

// Bonus XP for reaching specific depth states (RWLE §XV — epistemic depth rewarded)
export const XP_REVISE_BONUS = 5 // completing the REVISE state
export const XP_DEFEND_BONUS = 10 // completing the DEFEND state

// Multiplier applied when TRACE overall score ≥ 7 (RWLE §VIII — fluency is measurable)
export const XP_DEEP_THINKER_MULTIPLIER = 1.5

// Ethical reasoning bonus: ethical dimension score ≥ 6 adds flat bonus
export const XP_ETHICAL_BONUS = 2

// Deep Work Streak XP — REQ-18-08
export const XP_PER_DEEP_STREAK_DAY = 15 // vs. 5 XP for a lesson-only streak day

export const XP_TRACE_BONUS_PER_POINT = 5 // bonus per TRACE overall point above 5 (max +25)

/**
 * XP earned for a completed RACA deep-learning session.
 * Base award + TRACE fluency bonus. Max 50 XP per session.
 * @param traceOverall - TRACE overall score (0-10)
 */
export function traceSessionXP(traceOverall: number): number {
  const bonus = Math.max(0, Math.round((traceOverall - 5) * XP_TRACE_BONUS_PER_POINT))
  return XP_PER_TRACE_CYCLE + bonus
}

/**
 * XP breakdown for a completed RACA session, for display purposes.
 */
export function traceSessionXPBreakdown(traceOverall: number): {
  base: number
  bonus: number
  total: number
} {
  const bonus = Math.max(0, Math.round((traceOverall - 5) * XP_TRACE_BONUS_PER_POINT))
  return { base: XP_PER_TRACE_CYCLE, bonus, total: XP_PER_TRACE_CYCLE + bonus }
}

/**
 * Full XP calculation for a completed RACA session including depth bonuses.
 * Accounts for REVISE/DEFEND state completion, Deep Thinker multiplier,
 * and ethical reasoning bonus. (RWLE §XV — epistemic fluency is earned.)
 */
export function computeSessionXP(params: {
  traceOverall: number
  ethicalScore?: number
  reachedRevise?: boolean
  reachedDefend?: boolean
}): {
  base: number
  revise: number
  defend: number
  deepThinker: number
  ethical: number
  total: number
} {
  const { traceOverall, ethicalScore = 0, reachedRevise = false, reachedDefend = false } = params
  const base = traceSessionXP(traceOverall)
  const revise = reachedRevise ? XP_REVISE_BONUS : 0
  const defend = reachedDefend ? XP_DEFEND_BONUS : 0
  const ethical = ethicalScore >= 6 ? XP_ETHICAL_BONUS : 0
  const subtotal = base + revise + defend + ethical
  const deepThinker =
    traceOverall >= 7 ? Math.round(subtotal * (XP_DEEP_THINKER_MULTIPLIER - 1)) : 0
  const total = subtotal + deepThinker
  return { base, revise, defend, deepThinker, ethical, total }
}

export interface LevelInfo {
  level: number
  title: string
  emoji: string
  minXp: number
  color: string
}

export const LEVELS: LevelInfo[] = [
  { level: 1, minXp: 0, title: 'Seedling', emoji: '🌱', color: '#34d399' },
  { level: 2, minXp: 60, title: 'Explorer', emoji: '🔍', color: '#60a5fa' },
  { level: 3, minXp: 150, title: 'Builder', emoji: '🔧', color: '#a78bfa' },
  { level: 4, minXp: 280, title: 'Achiever', emoji: '⭐', color: '#f59e0b' },
  { level: 5, minXp: 450, title: 'Champion', emoji: '🏆', color: '#f97316' },
  { level: 6, minXp: 650, title: 'Legend', emoji: '🚀', color: '#ec4899' },
]

export function totalXP(lessonsCompleted: number, streakDays: number): number {
  return lessonsCompleted * XP_PER_LESSON + streakDays * XP_PER_STREAK_DAY
}

export interface LevelStatus {
  current: LevelInfo
  next: LevelInfo | null
  xp: number
  progressPct: number
  xpToNext: number | null
}

export function getLevelStatus(lessonsCompleted: number, streakDays: number): LevelStatus {
  const xp = totalXP(lessonsCompleted, streakDays)
  let currentIdx = 0
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].minXp) currentIdx = i
  }
  const current = LEVELS[currentIdx]
  const next = LEVELS[currentIdx + 1] ?? null
  const progressPct = next
    ? Math.round(((xp - current.minXp) / (next.minXp - current.minXp)) * 100)
    : 100
  const xpToNext = next ? next.minXp - xp : null
  return { current, next, xp, progressPct, xpToNext }
}
