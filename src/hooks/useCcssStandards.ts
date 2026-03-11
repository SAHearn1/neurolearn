// CCSS-01: Common Core Standards hook
// Queries student_ccss_evidence JOIN ccss_standards for a given user

import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useAuthStore } from '../store/authStore'

export interface CcssEvidence {
  standardCode: string
  strand: 'ELA' | 'Math'
  grade: string
  domain: string
  description: string
  evidenceCount: number
  masteryLevel: 'emerging' | 'developing' | 'proficient' | 'advanced'
  totalConfidence: number
  lastEvidencedAt: string
}

interface CcssStandardJoin {
  strand: string
  grade: string
  domain: string
  description: string
}

interface EvidenceRow {
  ccss_standard_code: string
  evidence_count: number
  total_confidence: number
  mastery_level: string
  last_evidenced_at: string
  // PostgREST returns nested records as arrays when using select join
  ccss_standards: CcssStandardJoin | CcssStandardJoin[] | null
}

export function useCcssStandards(userId?: string): {
  evidence: CcssEvidence[]
  loading: boolean
  byStrand: { ELA: CcssEvidence[]; Math: CcssEvidence[] }
  byGrade: Record<string, CcssEvidence[]>
} {
  const currentUser = useAuthStore((s) => s.user)
  const targetId = userId ?? currentUser?.id

  const [evidence, setEvidence] = useState<CcssEvidence[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!targetId) return

    let cancelled = false

    const run = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from('student_ccss_evidence')
        .select(
          `
          ccss_standard_code,
          evidence_count,
          total_confidence,
          mastery_level,
          last_evidenced_at,
          ccss_standards (
            strand,
            grade,
            domain,
            description
          )
        `,
        )
        .eq('user_id', targetId)

      if (cancelled) return

      if (error || !data) {
        setLoading(false)
        return
      }

      const mapped: CcssEvidence[] = (data as EvidenceRow[])
        .filter((row) => row.ccss_standards !== null)
        .map((row) => {
          // PostgREST may return a single object or array for FK joins
          const std = Array.isArray(row.ccss_standards) ? row.ccss_standards[0] : row.ccss_standards
          if (!std) return null
          return {
            standardCode: row.ccss_standard_code,
            strand: std.strand as 'ELA' | 'Math',
            grade: std.grade,
            domain: std.domain,
            description: std.description,
            evidenceCount: row.evidence_count,
            masteryLevel: row.mastery_level as CcssEvidence['masteryLevel'],
            totalConfidence: row.total_confidence,
            lastEvidencedAt: row.last_evidenced_at,
          }
        })
        .filter((e): e is CcssEvidence => e !== null)

      setEvidence(mapped)
      setLoading(false)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [targetId])

  const byStrand: { ELA: CcssEvidence[]; Math: CcssEvidence[] } = {
    ELA: evidence.filter((e) => e.strand === 'ELA'),
    Math: evidence.filter((e) => e.strand === 'Math'),
  }

  const byGrade: Record<string, CcssEvidence[]> = {}
  for (const e of evidence) {
    if (!byGrade[e.grade]) byGrade[e.grade] = []
    byGrade[e.grade].push(e)
  }

  return { evidence, loading, byStrand, byGrade }
}
