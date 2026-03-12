/**
 * ASS-02: Spaced Repetition Queue — SM-2 algorithm implementation
 */

export interface SpacedRepetitionItem {
  lessonId: string
  skillCode?: string
  courseId: string | null
  intervalDays: number
  repetitionCount: number
  easeFactor: number
}

/**
 * Computes the next review interval using the SM-2 algorithm.
 *
 * @param item - Current spaced repetition item
 * @param quality - Review quality score 0–5 (0–2 = failed, 3–5 = passed)
 */
export function computeNextInterval(
  item: SpacedRepetitionItem,
  quality: number,
): {
  nextIntervalDays: number
  newEaseFactor: number
  newRepetitionCount: number
} {
  const newEaseFactor = Math.max(
    1.3,
    item.easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02),
  )

  if (quality < 3) {
    return {
      nextIntervalDays: 1,
      newEaseFactor,
      newRepetitionCount: 0,
    }
  }

  let nextIntervalDays: number
  const newRepetitionCount = item.repetitionCount + 1

  if (item.repetitionCount === 0) {
    nextIntervalDays = 1
  } else if (item.repetitionCount === 1) {
    nextIntervalDays = 6
  } else {
    nextIntervalDays = Math.round(item.intervalDays * item.easeFactor)
  }

  return { nextIntervalDays, newEaseFactor, newRepetitionCount }
}

/**
 * Creates initial review schedule items after a session completes.
 * First review is due in 3 days.
 */
export function scheduleAfterSession(
  lessonId: string,
  courseId: string | null,
  skillCodes: string[],
): Array<{
  lessonId: string
  skillCode: string
  courseId: string | null
  dueAt: Date
  intervalDays: number
  easeFactor: number
  repetitionCount: number
}> {
  const dueAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)

  return skillCodes.map((skillCode) => ({
    lessonId,
    skillCode,
    courseId,
    dueAt,
    intervalDays: 3,
    easeFactor: 2.5,
    repetitionCount: 0,
  }))
}
