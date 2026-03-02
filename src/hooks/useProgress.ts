import { useCallback, useEffect, useMemo } from 'react'
import { useProgressStore } from '../store/progressStore'
import { getSupabaseClient } from '../../utils/supabase/client'

interface ProgressRecord {
  completed: boolean | null
  completed_at: string | null
  id: string
  lesson_id: string
  score: number | null
  user_id: string
}

export function useProgress(userId?: string) {
  const { items, setItems } = useProgressStore()

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase || !userId) {
      return
    }

    supabase
      .from('progress')
      .select('id,user_id,lesson_id,completed,score,completed_at')
      .eq('user_id', userId)
      .then(({ data, error }) => {
        if (error || !data) {
          return
        }

        const mapped = (data as ProgressRecord[]).map((item) => ({
          completed: Boolean(item.completed),
          completedAt: item.completed_at ?? undefined,
          id: item.id,
          lessonId: item.lesson_id,
          score: item.score ?? undefined,
          userId: item.user_id,
        }))

        setItems(mapped)
      })
  }, [setItems, userId])

  const completedCount = useMemo(() => items.filter((item) => item.completed).length, [items])

  const markLessonCompleted = useCallback(
    async (lessonId: string, currentUserId: string) => {
      const existing = items.find((item) => item.lessonId === lessonId && item.userId === currentUserId)

      const nextItems = existing
        ? items.map((item) =>
            item.id === existing.id
              ? { ...item, completed: true, completedAt: new Date().toISOString() }
              : item,
          )
        : [
            ...items,
            {
              completed: true,
              completedAt: new Date().toISOString(),
              id: `${currentUserId}-${lessonId}`,
              lessonId,
              userId: currentUserId,
            },
          ]

      setItems(nextItems)

      const supabase = getSupabaseClient()
      if (!supabase) {
        return
      }

      await (supabase as any).from('progress').upsert(
        {
          completed: true,
          completed_at: new Date().toISOString(),
          lesson_id: lessonId,
          user_id: currentUserId,
        },
        { onConflict: 'user_id,lesson_id' },
      )
    },
    [items, setItems],
  )

  return { completedCount, items, markLessonCompleted }
}
