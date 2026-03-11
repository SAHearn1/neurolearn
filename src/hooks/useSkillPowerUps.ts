// CCSS-03: Skill Power-Ups hook
// Queries skill_evidence_events grouped by skill_code for current user

import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useAuthStore } from '../store/authStore'

export interface SkillPowerUp {
  skillCode: string
  displayName: string
  level: number // 1-5 based on evidence count
  evidenceCount: number
  unlockedAt: string | null
  isNew: boolean // unlocked in last 24 hours
}

const SKILL_DISPLAY_NAMES: Record<string, string> = {
  'critical-thinking': 'Critical Thinking',
  argumentation: 'Argumentation',
  'self-regulation': 'Self-Regulation',
  'evidence-use': 'Using Evidence',
  inference: 'Making Inferences',
  'problem-solving': 'Problem Solving',
  'number-sense': 'Number Sense',
  fractions: 'Fractions',
  ratios: 'Ratios & Proportions',
  algebra: 'Algebra',
  functions: 'Functions',
  'data-analysis': 'Data Analysis',
  planning: 'Planning',
  framing: 'Framing',
  reflection: 'Reflection',
  orientation: 'Orientation',
  'self-awareness': 'Self-Awareness',
  synthesis: 'Synthesis',
  general: 'General Learning',
}

function computeLevel(count: number): number {
  if (count >= 21) return 5
  if (count >= 11) return 4
  if (count >= 6) return 3
  if (count >= 3) return 2
  return 1
}

function getDisplayName(skillCode: string): string {
  return SKILL_DISPLAY_NAMES[skillCode] ?? skillCode
}

export function useSkillPowerUps(): {
  powerUps: SkillPowerUp[]
  newPowerUps: SkillPowerUp[]
  loading: boolean
} {
  const user = useAuthStore((s) => s.user)
  const [powerUps, setPowerUps] = useState<SkillPowerUp[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user?.id) return

    let cancelled = false

    const run = async () => {
      setLoading(true)

      // Fetch all skill evidence events for this user
      const { data, error } = await supabase
        .from('skill_evidence_events')
        .select('skill_code, detected_at')
        .eq('user_id', user.id)
        .eq('evidence_type', 'skill_demonstrated')
        .not('skill_code', 'is', null)
        .order('detected_at', { ascending: true })

      if (cancelled) return

      if (error || !data) {
        setLoading(false)
        return
      }

      // Group by skill_code in memory
      const grouped = new Map<string, { count: number; firstAt: string }>()

      for (const row of data as Array<{ skill_code: string; detected_at: string }>) {
        const existing = grouped.get(row.skill_code)
        if (!existing) {
          grouped.set(row.skill_code, { count: 1, firstAt: row.detected_at })
        } else {
          existing.count += 1
        }
      }

      const now = Date.now()
      const oneDayMs = 24 * 60 * 60 * 1000

      const mapped: SkillPowerUp[] = []
      for (const [skillCode, { count, firstAt }] of grouped.entries()) {
        const unlockedAt = firstAt
        const isNew = now - new Date(unlockedAt).getTime() < oneDayMs

        mapped.push({
          skillCode,
          displayName: getDisplayName(skillCode),
          level: computeLevel(count),
          evidenceCount: count,
          unlockedAt,
          isNew,
        })
      }

      // Sort by evidenceCount descending
      mapped.sort((a, b) => b.evidenceCount - a.evidenceCount)

      setPowerUps(mapped)
      setLoading(false)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const newPowerUps = powerUps.filter((p) => p.isNew)

  return { powerUps, newPowerUps, loading }
}
