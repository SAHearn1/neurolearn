// DATA-01: Learning Transcript hook
// Aggregates student data from multiple tables

import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useAuthStore } from '../store/authStore'
import type { CcssEvidence } from './useCcssStandards'

export interface LearningTranscript {
  studentName: string
  generatedAt: string
  lessonsCompleted: number
  coursesEnrolled: number
  totalStreakDays: number
  masteryScore: number
  traceAverages: Record<string, number> | null
  ccssEvidence: CcssEvidence[]
  recentGoals: string[]
  powerUpCount: number
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

interface EnrollmentRow {
  id: string
}

interface CcssRow {
  ccss_standard_code: string
  evidence_count: number
  total_confidence: number
  mastery_level: string
  last_evidenced_at: string
  ccss_standards: {
    strand: string
    grade: string
    domain: string
    description: string
  } | null
}

interface SkillCountRow {
  skill_code: string
}

export function useLearningTranscript(studentId?: string): {
  transcript: LearningTranscript | null
  loading: boolean
} {
  const currentUser = useAuthStore((s) => s.user)
  const targetId = studentId ?? currentUser?.id

  const [transcript, setTranscript] = useState<LearningTranscript | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!targetId) return

    let cancelled = false

    const run = async () => {
      setLoading(true)

      const [
        profileResult,
        epistemicResult,
        adaptiveResult,
        goalsResult,
        ccssResult,
        enrollmentsResult,
        skillsResult,
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('display_name, lessons_completed, streak_days')
          .eq('user_id', targetId)
          .maybeSingle(),
        supabase
          .from('epistemic_profiles')
          .select('trace_averages')
          .eq('user_id', targetId)
          .maybeSingle(),
        supabase
          .from('adaptive_learning_state')
          .select('mastery_score_float')
          .eq('user_id', targetId)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('student_learning_goals')
          .select('goal_text')
          .eq('user_id', targetId)
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('student_ccss_evidence')
          .select(
            `ccss_standard_code, evidence_count, total_confidence, mastery_level, last_evidenced_at,
            ccss_standards(strand, grade, domain, description)`,
          )
          .eq('user_id', targetId)
          .order('evidence_count', { ascending: false })
          .limit(5),
        supabase.from('course_enrollments').select('id').eq('user_id', targetId),
        supabase
          .from('skill_evidence_events')
          .select('skill_code')
          .eq('user_id', targetId)
          .eq('evidence_type', 'skill_demonstrated')
          .not('skill_code', 'is', null),
      ])

      if (cancelled) return

      const profile = profileResult.data as ProfileRow | null
      const epistemic = epistemicResult.data as EpistemicRow | null
      const adaptive = adaptiveResult.data as AdaptiveRow | null
      const goals = (goalsResult.data as GoalRow[] | null) ?? []
      const ccssRows = (ccssResult.data as CcssRow[] | null) ?? []
      const enrollments = (enrollmentsResult.data as EnrollmentRow[] | null) ?? []
      const skillRows = (skillsResult.data as SkillCountRow[] | null) ?? []

      // Map CCSS rows
      const ccssEvidence: CcssEvidence[] = ccssRows
        .filter((row) => row.ccss_standards !== null)
        .map((row) => ({
          standardCode: row.ccss_standard_code,
          strand: row.ccss_standards!.strand as 'ELA' | 'Math',
          grade: row.ccss_standards!.grade,
          domain: row.ccss_standards!.domain,
          description: row.ccss_standards!.description,
          evidenceCount: row.evidence_count,
          masteryLevel: row.mastery_level as CcssEvidence['masteryLevel'],
          totalConfidence: row.total_confidence,
          lastEvidencedAt: row.last_evidenced_at,
        }))

      // Count unique skill codes demonstrated
      const uniqueSkills = new Set(skillRows.map((r) => r.skill_code)).size

      setTranscript({
        studentName: profile?.display_name ?? 'Student',
        generatedAt: new Date().toISOString(),
        lessonsCompleted: profile?.lessons_completed ?? 0,
        coursesEnrolled: enrollments.length,
        totalStreakDays: profile?.streak_days ?? 0,
        masteryScore: adaptive?.mastery_score_float ?? 0,
        traceAverages: epistemic?.trace_averages ?? null,
        ccssEvidence,
        recentGoals: goals.map((g) => g.goal_text),
        powerUpCount: uniqueSkills,
      })

      setLoading(false)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [targetId])

  return { transcript, loading }
}
