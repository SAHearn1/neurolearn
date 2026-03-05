/**
 * XP & Level system — rewards are tied to observable learning behaviors,
 * not AI output. Aligns with RWLE principle: epistemic fluency is earned
 * through doing, not receiving.
 */

export const XP_PER_LESSON = 10
export const XP_PER_STREAK_DAY = 5

// RACA session XP — REQ-18-01
export const XP_PER_RACA_SESSION_BASE = 25 // base for completing any RACA session
export const XP_TRACE_BONUS_PER_POINT = 5 // bonus per TRACE overall point above 5 (max +25)

/**
 * XP earned for a completed RACA deep-learning session.
 * Base award + TRACE fluency bonus. Max 50 XP per session.
 * @param traceOverall - TRACE overall score (0-10)
 */
export function traceSessionXP(traceOverall: number): number {
  const bonus = Math.max(0, Math.round((traceOverall - 5) * XP_TRACE_BONUS_PER_POINT))
  return XP_PER_RACA_SESSION_BASE + bonus
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
  return { base: XP_PER_RACA_SESSION_BASE, bonus, total: XP_PER_RACA_SESSION_BASE + bonus }
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
