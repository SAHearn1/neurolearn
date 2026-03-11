// PAR-05: Parent growth narratives hook
// Reads cached narratives from session_parent_narratives table

import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useAuthStore } from '../store/authStore'

export interface ParentNarrative {
  sessionIdentifier: string
  narrativeText: string
  generatedAt: string
}

interface NarrativeRow {
  session_identifier: string
  narrative_text: string
  generated_at: string
}

export function useParentNarratives(studentId?: string): {
  narratives: ParentNarrative[]
  loading: boolean
} {
  const currentUser = useAuthStore((s) => s.user)
  const targetId = studentId ?? currentUser?.id

  const [narratives, setNarratives] = useState<ParentNarrative[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!targetId) return

    let cancelled = false

    const run = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from('session_parent_narratives')
        .select('session_identifier, narrative_text, generated_at')
        .eq('user_id', targetId)
        .order('generated_at', { ascending: false })
        .limit(10)

      if (cancelled) return

      if (error || !data) {
        setLoading(false)
        return
      }

      const mapped: ParentNarrative[] = (data as NarrativeRow[]).map((row) => ({
        sessionIdentifier: row.session_identifier,
        narrativeText: row.narrative_text,
        generatedAt: row.generated_at,
      }))

      setNarratives(mapped)
      setLoading(false)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [targetId])

  return { narratives, loading }
}
