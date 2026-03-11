// EDU-15: LCP Generator hook
// Aggregates student data for Learner Cognitive Profile PDF generation

import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase/client'

export interface LcpData {
  studentName: string
  generatedAt: string
  traceAverages: Record<string, number> | null
  masteryScore: number
  regulationTrend: string
  educatorNotes: string
  goalsText: string[]
  lessonsCompleted: number
  streakDays: number
}

interface ProfileRow {
  display_name: string
  lessons_completed: number
  streak_days: number
}

interface EpistemicRow {
  trace_averages: Record<string, number> | null
}

interface AdaptiveRow {
  mastery_score_float: number | null
}

interface GoalRow {
  goal_text: string
}

export function useLcpGenerator(studentId: string): {
  lcpData: LcpData | null
  loading: boolean
  setEducatorNotes: (notes: string) => void
  educatorNotes: string
} {
  const [lcpData, setLcpData] = useState<LcpData | null>(null)
  const [loading, setLoading] = useState(false)
  const [educatorNotes, setEducatorNotes] = useState('')

  useEffect(() => {
    if (!studentId) return

    let cancelled = false

    const run = async () => {
      setLoading(true)

      const [profileResult, epistemicResult, adaptiveResult, goalsResult, regulationResult] =
        await Promise.all([
          supabase
            .from('profiles')
            .select('display_name, lessons_completed, streak_days')
            .eq('user_id', studentId)
            .maybeSingle(),
          supabase
            .from('epistemic_profiles')
            .select('trace_averages')
            .eq('user_id', studentId)
            .maybeSingle(),
          supabase
            .from('adaptive_learning_state')
            .select('mastery_score_float')
            .eq('user_id', studentId)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from('student_learning_goals')
            .select('goal_text')
            .eq('user_id', studentId)
            .eq('active', true)
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('regulation_checkins')
            .select('level, checked_in_at')
            .eq('user_id', studentId)
            .order('checked_in_at', { ascending: false })
            .limit(3),
        ])

      if (cancelled) return

      const profile = profileResult.data as ProfileRow | null
      const epistemic = epistemicResult.data as EpistemicRow | null
      const adaptive = adaptiveResult.data as AdaptiveRow | null
      const goals = (goalsResult.data as GoalRow[] | null) ?? []
      const checkins = (regulationResult.data as Array<{ level: string }> | null) ?? []

      // Compute regulation trend from last 3 checkins
      let regulationTrend = 'No recent data'
      if (checkins.length > 0) {
        const levelValues = checkins.map((c) => {
          if (c.level === 'ready') return 100
          if (c.level === 'distracted') return 50
          return 20
        })
        const avg = levelValues.reduce((a, b) => a + b, 0) / levelValues.length
        if (avg >= 70) regulationTrend = 'Positive — mostly entering sessions regulated'
        else if (avg >= 40)
          regulationTrend = 'Variable — regulation levels mixed across recent sessions'
        else regulationTrend = 'Low regulation — additional co-regulation support may help'
      }

      setLcpData({
        studentName: profile?.display_name ?? 'Student',
        generatedAt: new Date().toISOString(),
        traceAverages: epistemic?.trace_averages ?? null,
        masteryScore: adaptive?.mastery_score_float ?? 0,
        regulationTrend,
        educatorNotes: '',
        goalsText: goals.map((g) => g.goal_text),
        lessonsCompleted: profile?.lessons_completed ?? 0,
        streakDays: profile?.streak_days ?? 0,
      })

      setLoading(false)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [studentId])

  return { lcpData, loading, setEducatorNotes, educatorNotes }
}
