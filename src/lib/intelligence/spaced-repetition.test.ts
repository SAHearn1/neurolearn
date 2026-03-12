import { describe, expect, it } from 'vitest'
import { scheduleAfterSession } from './spaced-repetition'

describe('scheduleAfterSession', () => {
  it('includes courseId on each scheduled review item', () => {
    const items = scheduleAfterSession('lesson-1', 'course-1', ['TRACE-A', 'TRACE-B'])

    expect(items).toHaveLength(2)
    expect(items[0]).toMatchObject({
      lessonId: 'lesson-1',
      courseId: 'course-1',
      skillCode: 'TRACE-A',
      intervalDays: 3,
      easeFactor: 2.5,
      repetitionCount: 0,
    })
    expect(items[1]).toMatchObject({
      lessonId: 'lesson-1',
      courseId: 'course-1',
      skillCode: 'TRACE-B',
      intervalDays: 3,
      easeFactor: 2.5,
      repetitionCount: 0,
    })
  })
})
