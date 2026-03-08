import { describe, it, expect } from 'vitest'
import {
  XP_PER_LESSON,
  XP_PER_STREAK_DAY,
  XP_PER_TRACE_CYCLE,
  XP_REVISE_BONUS,
  XP_DEFEND_BONUS,
  XP_DEEP_THINKER_MULTIPLIER,
  XP_ETHICAL_BONUS,
  XP_PER_DEEP_STREAK_DAY,
  traceSessionXP,
  traceSessionXPBreakdown,
  computeSessionXP,
  totalXP,
  getLevelStatus,
} from './xp'

describe('XP constants', () => {
  it('has lesson and streak constants', () => {
    expect(XP_PER_LESSON).toBe(10)
    expect(XP_PER_STREAK_DAY).toBe(5)
  })

  it('has RACA session constants', () => {
    expect(XP_PER_TRACE_CYCLE).toBe(25)
    expect(XP_REVISE_BONUS).toBe(5)
    expect(XP_DEFEND_BONUS).toBe(10)
    expect(XP_DEEP_THINKER_MULTIPLIER).toBe(1.5)
    expect(XP_ETHICAL_BONUS).toBe(2)
    expect(XP_PER_DEEP_STREAK_DAY).toBe(15)
  })
})

describe('traceSessionXP', () => {
  it('returns base XP for TRACE score of 5', () => {
    expect(traceSessionXP(5)).toBe(XP_PER_TRACE_CYCLE)
  })

  it('returns base XP when TRACE score is below 5', () => {
    expect(traceSessionXP(3)).toBe(XP_PER_TRACE_CYCLE)
    expect(traceSessionXP(0)).toBe(XP_PER_TRACE_CYCLE)
  })

  it('adds bonus XP for TRACE scores above 5', () => {
    // TRACE 7 → (7-5) * 5 = 10 bonus
    expect(traceSessionXP(7)).toBe(XP_PER_TRACE_CYCLE + 10)
    // TRACE 10 → (10-5) * 5 = 25 bonus
    expect(traceSessionXP(10)).toBe(XP_PER_TRACE_CYCLE + 25)
  })
})

describe('traceSessionXPBreakdown', () => {
  it('returns correct breakdown structure', () => {
    const result = traceSessionXPBreakdown(7)
    expect(result.base).toBe(XP_PER_TRACE_CYCLE)
    expect(result.bonus).toBe(10)
    expect(result.total).toBe(XP_PER_TRACE_CYCLE + 10)
  })

  it('has zero bonus when TRACE ≤ 5', () => {
    const result = traceSessionXPBreakdown(4)
    expect(result.bonus).toBe(0)
    expect(result.total).toBe(XP_PER_TRACE_CYCLE)
  })
})

describe('computeSessionXP', () => {
  it('returns base only when no depth states reached', () => {
    const result = computeSessionXP({ traceOverall: 5 })
    expect(result.revise).toBe(0)
    expect(result.defend).toBe(0)
    expect(result.ethical).toBe(0)
    expect(result.deepThinker).toBe(0)
    expect(result.total).toBe(XP_PER_TRACE_CYCLE)
  })

  it('adds REVISE_BONUS when reachedRevise=true', () => {
    const result = computeSessionXP({ traceOverall: 5, reachedRevise: true })
    expect(result.revise).toBe(XP_REVISE_BONUS)
    expect(result.total).toBe(XP_PER_TRACE_CYCLE + XP_REVISE_BONUS)
  })

  it('adds DEFEND_BONUS when reachedDefend=true', () => {
    const result = computeSessionXP({ traceOverall: 5, reachedDefend: true })
    expect(result.defend).toBe(XP_DEFEND_BONUS)
    expect(result.total).toBe(XP_PER_TRACE_CYCLE + XP_DEFEND_BONUS)
  })

  it('adds ethical bonus when ethical score ≥ 6', () => {
    const result = computeSessionXP({ traceOverall: 5, ethicalScore: 6 })
    expect(result.ethical).toBe(XP_ETHICAL_BONUS)
    expect(result.total).toBe(XP_PER_TRACE_CYCLE + XP_ETHICAL_BONUS)
  })

  it('does not add ethical bonus when ethical score < 6', () => {
    const result = computeSessionXP({ traceOverall: 5, ethicalScore: 5 })
    expect(result.ethical).toBe(0)
  })

  it('applies Deep Thinker multiplier (1.5×) when TRACE ≥ 7', () => {
    // traceOverall=7 → base=25+(7-5)*5=35, revise+defend=15, ethical=0, subtotal=50
    // deepThinker = round(50 * 0.5) = 25
    const result = computeSessionXP({
      traceOverall: 7,
      reachedRevise: true,
      reachedDefend: true,
    })
    expect(result.deepThinker).toBeGreaterThan(0)
    expect(result.total).toBe(
      result.base + result.revise + result.defend + result.ethical + result.deepThinker,
    )
  })

  it('does not apply Deep Thinker multiplier when TRACE < 7', () => {
    const result = computeSessionXP({ traceOverall: 6 })
    expect(result.deepThinker).toBe(0)
  })
})

describe('totalXP', () => {
  it('correctly combines lesson and streak XP', () => {
    expect(totalXP(5, 3)).toBe(5 * 10 + 3 * 5)
  })
})

describe('getLevelStatus', () => {
  it('returns level 1 for zero XP', () => {
    const status = getLevelStatus(0, 0)
    expect(status.current.level).toBe(1)
    expect(status.xp).toBe(0)
  })

  it('returns correct next level info', () => {
    const status = getLevelStatus(0, 0)
    expect(status.next).not.toBeNull()
    expect(status.xpToNext).toBeGreaterThan(0)
  })

  it('returns 100% progress and null next at max level', () => {
    const status = getLevelStatus(1000, 0)
    expect(status.current.level).toBe(6)
    expect(status.next).toBeNull()
    expect(status.progressPct).toBe(100)
  })
})
