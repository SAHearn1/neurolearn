import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useAuthStore } from '../store/authStore'

export interface StudentGoal {
  id: string
  goalText: string
  goalType: 'open' | 'skill' | 'exam' | 'curiosity'
  createdAt: string
  active: boolean
  achieved: boolean
  achievedAt: string | null
}

interface GoalRow {
  id: string
  goal_text: string
  goal_type: string
  created_at: string
  active: boolean
  achieved: boolean
  achieved_at: string | null
}

/**
 * AGY-01: Student Learning Goals Hook
 * Manages CRUD for student_learning_goals table.
 */
export function useStudentGoals(): {
  goals: StudentGoal[]
  activeGoal: StudentGoal | null
  addGoal: (text: string, type: StudentGoal['goalType']) => Promise<void>
  markAchieved: (goalId: string) => Promise<void>
  loading: boolean
} {
  const user = useAuthStore((s) => s.user)
  const [goals, setGoals] = useState<StudentGoal[]>([])
  const [loading, setLoading] = useState(true)

  const fetchGoals = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('student_learning_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const mapped: StudentGoal[] = ((data as GoalRow[]) ?? []).map((row) => ({
        id: row.id,
        goalText: row.goal_text,
        goalType: row.goal_type as StudentGoal['goalType'],
        createdAt: row.created_at,
        active: row.active,
        achieved: row.achieved,
        achievedAt: row.achieved_at,
      }))

      setGoals(mapped)
    } catch {
      setGoals([])
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  const addGoal = useCallback(
    async (text: string, type: StudentGoal['goalType']) => {
      if (!user?.id) return

      // Deactivate previous active goals
      await supabase
        .from('student_learning_goals')
        .update({ active: false })
        .eq('user_id', user.id)
        .eq('active', true)

      const { error } = await supabase.from('student_learning_goals').insert({
        user_id: user.id,
        goal_text: text,
        goal_type: type,
        active: true,
        achieved: false,
      })

      if (error) throw error
      await fetchGoals()
    },
    [user?.id, fetchGoals],
  )

  const markAchieved = useCallback(
    async (goalId: string) => {
      if (!user?.id) return

      const { error } = await supabase
        .from('student_learning_goals')
        .update({
          achieved: true,
          achieved_at: new Date().toISOString(),
          active: false,
        })
        .eq('id', goalId)
        .eq('user_id', user.id)

      if (error) throw error
      await fetchGoals()
    },
    [user?.id, fetchGoals],
  )

  const activeGoal = goals.find((g) => g.active && !g.achieved) ?? null

  return { goals, activeGoal, addGoal, markAchieved, loading }
}
