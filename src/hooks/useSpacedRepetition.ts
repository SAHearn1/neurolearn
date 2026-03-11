import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useAuthStore } from '../store/authStore'
import { scheduleAfterSession, computeNextInterval } from '../lib/intelligence/spaced-repetition'
import type { SpacedRepetitionItem } from '../lib/intelligence/spaced-repetition'

interface QueueRow {
  id: string
  lesson_id: string
  skill_code: string | null
  course_id: string | null
  interval_days: number
  repetition_count: number
  ease_factor: number
  due_at: string
  status: string
}

/**
 * ASS-02: Spaced Repetition Hook
 * Manages the spaced_repetition_queue table with SM-2 scheduling.
 */
export function useSpacedRepetition(): {
  dueItems: (SpacedRepetitionItem & { id: string })[]
  scheduleReview: (lessonId: string, skillCodes: string[]) => Promise<void>
  markReviewed: (itemId: string, quality: number) => Promise<void>
  loading: boolean
} {
  const user = useAuthStore((s) => s.user)
  const [dueItems, setDueItems] = useState<(SpacedRepetitionItem & { id: string })[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDueItems = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('spaced_repetition_queue')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .lte('due_at', new Date().toISOString())
        .order('due_at', { ascending: true })

      if (error) throw error

      const items: (SpacedRepetitionItem & { id: string })[] = ((data as QueueRow[]) ?? []).map(
        (row) => ({
          id: row.id,
          lessonId: row.lesson_id,
          skillCode: row.skill_code ?? undefined,
          courseId: row.course_id ?? null,
          intervalDays: row.interval_days,
          repetitionCount: row.repetition_count,
          easeFactor: row.ease_factor,
        }),
      )

      setDueItems(items)
    } catch {
      setDueItems([])
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchDueItems()
  }, [fetchDueItems])

  const scheduleReview = useCallback(
    async (lessonId: string, skillCodes: string[]) => {
      if (!user?.id) return

      const scheduled = scheduleAfterSession(lessonId, skillCodes)

      const rows = scheduled.map((item) => ({
        user_id: user.id,
        lesson_id: item.lessonId,
        skill_code: item.skillCode,
        due_at: item.dueAt.toISOString(),
        interval_days: item.intervalDays,
        ease_factor: item.easeFactor,
        repetition_count: item.repetitionCount,
        status: 'pending',
      }))

      const { error } = await supabase.from('spaced_repetition_queue').insert(rows)
      if (error) throw error
    },
    [user?.id],
  )

  const markReviewed = useCallback(
    async (itemId: string, quality: number) => {
      if (!user?.id) return

      // Find the item in dueItems
      const item = dueItems.find((i) => i.id === itemId)
      if (!item) return

      const { nextIntervalDays, newEaseFactor, newRepetitionCount } = computeNextInterval(
        item,
        quality,
      )

      // Mark current item as completed
      await supabase
        .from('spaced_repetition_queue')
        .update({
          status: 'completed',
          last_reviewed_at: new Date().toISOString(),
        })
        .eq('id', itemId)
        .eq('user_id', user.id)

      // Insert next review item
      const nextDueAt = new Date(Date.now() + nextIntervalDays * 24 * 60 * 60 * 1000).toISOString()

      await supabase.from('spaced_repetition_queue').insert({
        user_id: user.id,
        lesson_id: item.lessonId,
        skill_code: item.skillCode ?? null,
        course_id: item.courseId ?? null,
        due_at: nextDueAt,
        interval_days: nextIntervalDays,
        ease_factor: newEaseFactor,
        repetition_count: newRepetitionCount,
        status: 'pending',
      })

      await fetchDueItems()
    },
    [user?.id, dueItems, fetchDueItems],
  )

  return { dueItems, scheduleReview, markReviewed, loading }
}
