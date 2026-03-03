import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useAuthStore } from '../store/authStore'

interface AdaptiveLearningState {
  id: string
  user_id: string
  course_id: string
  current_difficulty: 'easy' | 'medium' | 'hard' | 'adaptive'
  mastery_score: number
  recommended_lesson_id: string | null
  learning_velocity: number | null
  strengths: string[]
  weaknesses: string[]
  last_assessment_at: string | null
  created_at: string
  updated_at: string
}

interface DifficultyAdjustment {
  newDifficulty: 'easy' | 'medium' | 'hard' | 'adaptive'
  reason: string
}

export function useAdaptiveLearning(courseId: string | undefined) {
  const user = useAuthStore((s) => s.user)
  const [state, setState] = useState<AdaptiveLearningState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchState = useCallback(async () => {
    if (!user?.id || !courseId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('adaptive_learning_state')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single()

      if (err && err.code !== 'PGRST116') throw err
      setState(data as AdaptiveLearningState | null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load adaptive state')
    } finally {
      setLoading(false)
    }
  }, [user?.id, courseId])

  useEffect(() => {
    fetchState()
  }, [fetchState])

  const computeDifficultyAdjustment = useCallback(
    async (recentScores: number[]): Promise<DifficultyAdjustment | null> => {
      if (recentScores.length < 2) return null

      const currentDifficulty = state?.current_difficulty ?? 'medium'
      const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length

      // Promote: 3 consecutive >= 80%
      const lastThree = recentScores.slice(-3)
      if (lastThree.length >= 3 && lastThree.every((s) => s >= 80)) {
        const levels = ['easy', 'medium', 'hard', 'adaptive'] as const
        const currentIdx = levels.indexOf(currentDifficulty)
        if (currentIdx < levels.length - 1) {
          return {
            newDifficulty: levels[currentIdx + 1],
            reason: `3 consecutive scores >= 80% (avg: ${Math.round(avgScore)}%)`,
          }
        }
      }

      // Demote: 2 consecutive < 50%
      const lastTwo = recentScores.slice(-2)
      if (lastTwo.length >= 2 && lastTwo.every((s) => s < 50)) {
        const levels = ['easy', 'medium', 'hard', 'adaptive'] as const
        const currentIdx = levels.indexOf(currentDifficulty)
        if (currentIdx > 0) {
          return {
            newDifficulty: levels[currentIdx - 1],
            reason: `2 consecutive scores < 50% (avg: ${Math.round(avgScore)}%)`,
          }
        }
      }

      return null
    },
    [state?.current_difficulty],
  )

  const updateAdaptiveState = useCallback(
    async (
      updates: Partial<
        Pick<
          AdaptiveLearningState,
          | 'current_difficulty'
          | 'mastery_score'
          | 'recommended_lesson_id'
          | 'learning_velocity'
          | 'strengths'
          | 'weaknesses'
        >
      >,
    ) => {
      if (!user?.id || !courseId) return

      const { error: err } = await supabase.from('adaptive_learning_state').upsert({
        user_id: user.id,
        course_id: courseId,
        ...updates,
        last_assessment_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (err) throw err
      await fetchState()
    },
    [user?.id, courseId, fetchState],
  )

  const computeLearningVelocity = useCallback(async (): Promise<number> => {
    if (!user?.id || !courseId) return 0

    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

    const { data, error: err } = await supabase
      .from('lesson_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .eq('status', 'completed')
      .gte('completed_at', twoWeeksAgo)

    if (err) throw err
    return ((data?.length ?? 0) / 14) * 7 // lessons per week
  }, [user?.id, courseId])

  return {
    state,
    loading,
    error,
    computeDifficultyAdjustment,
    updateAdaptiveState,
    computeLearningVelocity,
    refetch: fetchState,
  }
}
