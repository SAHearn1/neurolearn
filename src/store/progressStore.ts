import { create } from 'zustand'
import { supabase } from '../../utils/supabase/client'
import type { LessonProgress, CourseProgress } from '../types/progress'

interface ProgressState {
  lessonProgress: Record<string, LessonProgress>
  courseProgress: Record<string, CourseProgress>
  loading: boolean

  fetchCourseProgress: (userId: string, courseId: string) => Promise<void>
  fetchLessonProgress: (userId: string, lessonId: string) => Promise<void>
  updateLessonProgress: (
    progress: Pick<LessonProgress, 'user_id' | 'lesson_id' | 'course_id' | 'status'> &
      Partial<Pick<LessonProgress, 'score' | 'time_spent_seconds'>>,
  ) => Promise<void>
  reset: () => void
}

export const useProgressStore = create<ProgressState>((set) => ({
  lessonProgress: {},
  courseProgress: {},
  loading: false,

  fetchCourseProgress: async (userId, courseId) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('course_id', courseId)

      if (error) throw error

      const byLesson: Record<string, LessonProgress> = {}
      let completed = 0
      for (const row of data ?? []) {
        byLesson[row.lesson_id] = row as LessonProgress
        if (row.status === 'completed') completed++
      }

      const total = (data ?? []).length || 1
      set((state) => ({
        lessonProgress: { ...state.lessonProgress, ...byLesson },
        courseProgress: {
          ...state.courseProgress,
          [courseId]: {
            course_id: courseId,
            user_id: userId,
            total_lessons: total,
            completed_lessons: completed,
            percent_complete: Math.round((completed / total) * 100),
            status:
              completed === total ? 'completed' : completed > 0 ? 'in_progress' : 'not_started',
          },
        },
      }))
    } finally {
      set({ loading: false })
    }
  },

  fetchLessonProgress: async (userId, lessonId) => {
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .maybeSingle()

    if (error) throw error
    if (data) {
      set((state) => ({
        lessonProgress: { ...state.lessonProgress, [lessonId]: data as LessonProgress },
      }))
    }
  },

  updateLessonProgress: async (progress) => {
    const now = new Date().toISOString()
    const payload = {
      ...progress,
      time_spent_seconds: progress.time_spent_seconds ?? 0,
      score: progress.score ?? null,
      completed_at: progress.status === 'completed' ? now : null,
      updated_at: now,
    }

    const { error } = await supabase
      .from('lesson_progress')
      .upsert(payload, { onConflict: 'user_id,lesson_id' })

    if (error) throw error

    set((state) => ({
      lessonProgress: {
        ...state.lessonProgress,
        [progress.lesson_id]: {
          ...state.lessonProgress[progress.lesson_id],
          ...payload,
        } as LessonProgress,
      },
    }))
  },

  reset: () => set({ lessonProgress: {}, courseProgress: {}, loading: false }),
}))
