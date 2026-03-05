/**
 * XP & Level system — rewards are tied to observable learning behaviors,
 * not AI output. Aligns with RWLE principle: epistemic fluency is earned
 * through doing, not receiving.
 */

export const XP_PER_LESSON = 10
export const XP_PER_STREAK_DAY = 5
// Future: XP_PER_TRACE_CYCLE, XP_PER_REVISION, XP_PER_DEFENSE

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
