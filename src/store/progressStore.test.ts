import { describe, expect, it, beforeEach, vi } from 'vitest'
import { useProgressStore } from './progressStore'
import { supabase } from '../../utils/supabase/client'
import { buildProgress } from '../lib/test-utils'

beforeEach(() => {
  useProgressStore.setState({ lessonProgress: {}, courseProgress: {}, loading: false })
})

describe('useProgressStore', () => {
  it('starts with empty state', () => {
    const state = useProgressStore.getState()
    expect(state.lessonProgress).toEqual({})
    expect(state.courseProgress).toEqual({})
    expect(state.loading).toBe(false)
  })

  it('resets state', () => {
    useProgressStore.getState().reset()
    const state = useProgressStore.getState()
    expect(state.lessonProgress).toEqual({})
    expect(state.courseProgress).toEqual({})
  })

  describe('fetchCourseProgress', () => {
    it('sets loading true then false', async () => {
      const loadingStates: boolean[] = []
      const unsubscribe = useProgressStore.subscribe((s) => loadingStates.push(s.loading))
      await useProgressStore.getState().fetchCourseProgress('user-1', 'course-1')
      unsubscribe()
      expect(loadingStates).toContain(true)
      expect(useProgressStore.getState().loading).toBe(false)
    })

    it('computes courseProgress as not_started when no lessons completed', async () => {
      const rows = [
        { lesson_id: 'lesson-1', status: 'not_started', course_id: 'course-1', user_id: 'user-1' },
        { lesson_id: 'lesson-2', status: 'not_started', course_id: 'course-1', user_id: 'user-1' },
      ]
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        then: vi
          .fn()
          .mockImplementation((resolve: (v: unknown) => void) =>
            resolve({ data: rows, error: null }),
          ),
      } as never)
      await useProgressStore.getState().fetchCourseProgress('user-1', 'course-1')
      const cp = useProgressStore.getState().courseProgress['course-1']
      expect(cp.status).toBe('not_started')
      expect(cp.completed_lessons).toBe(0)
    })

    it('computes courseProgress as in_progress when partially completed', async () => {
      const rows = [
        { lesson_id: 'lesson-1', status: 'completed', course_id: 'course-1', user_id: 'user-1' },
        { lesson_id: 'lesson-2', status: 'not_started', course_id: 'course-1', user_id: 'user-1' },
      ]
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        then: vi
          .fn()
          .mockImplementation((resolve: (v: unknown) => void) =>
            resolve({ data: rows, error: null }),
          ),
      } as never)
      await useProgressStore.getState().fetchCourseProgress('user-1', 'course-1')
      const cp = useProgressStore.getState().courseProgress['course-1']
      expect(cp.status).toBe('in_progress')
      expect(cp.completed_lessons).toBe(1)
    })

    it('computes courseProgress as completed when all lessons done', async () => {
      const rows = [
        { lesson_id: 'lesson-1', status: 'completed', course_id: 'course-1', user_id: 'user-1' },
        { lesson_id: 'lesson-2', status: 'completed', course_id: 'course-1', user_id: 'user-1' },
      ]
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        then: vi
          .fn()
          .mockImplementation((resolve: (v: unknown) => void) =>
            resolve({ data: rows, error: null }),
          ),
      } as never)
      await useProgressStore.getState().fetchCourseProgress('user-1', 'course-1')
      const cp = useProgressStore.getState().courseProgress['course-1']
      expect(cp.status).toBe('completed')
      expect(cp.percent_complete).toBe(100)
    })
  })

  describe('fetchLessonProgress', () => {
    it('stores lesson progress data when found', async () => {
      const lessonData = buildProgress({ lesson_id: 'lesson-99', status: 'in_progress' })
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: lessonData, error: null }),
      } as never)
      await useProgressStore.getState().fetchLessonProgress('user-1', 'lesson-99')
      expect(useProgressStore.getState().lessonProgress['lesson-99']).toBeDefined()
    })

    it('does not update state when no data returned', async () => {
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      } as never)
      await useProgressStore.getState().fetchLessonProgress('user-1', 'lesson-missing')
      expect(useProgressStore.getState().lessonProgress['lesson-missing']).toBeUndefined()
    })
  })

  describe('updateLessonProgress', () => {
    it('updates lessonProgress in the store after successful upsert', async () => {
      vi.mocked(supabase.from).mockReturnValueOnce({
        upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
      } as never)
      await useProgressStore.getState().updateLessonProgress({
        user_id: 'user-1',
        lesson_id: 'lesson-5',
        course_id: 'course-1',
        status: 'completed',
        score: 90,
      })
      const lp = useProgressStore.getState().lessonProgress['lesson-5']
      expect(lp).toBeDefined()
      expect(lp.status).toBe('completed')
    })
  })
})
