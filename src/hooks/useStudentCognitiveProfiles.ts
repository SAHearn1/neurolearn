import { useEffect, useState } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useAuthStore } from '../store/authStore'
import type { CognitiveProfile } from '../lib/raca/types/epistemic'

interface StudentWithProfile {
  student_id: string
  display_name: string | null
  avatar_url: string | null
  profile: CognitiveProfile | null
}

interface UseStudentCognitiveProfilesResult {
  students: StudentWithProfile[]
  loading: boolean
  error: string | null
}

/**
 * Fetches epistemic profiles for all students linked to the current educator.
 * Requires educator_student_links RLS policy (migration 018) and epistemic_profiles
 * educator read policy (migration 033).
 */
export function useStudentCognitiveProfiles(): UseStudentCognitiveProfilesResult {
  const user = useAuthStore((s) => s.user)
  const [students, setStudents] = useState<StudentWithProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return

    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(null)

      // Step 1: get linked student IDs + display names
      const { data: links, error: linksErr } = await supabase
        .from('educator_student_links')
        .select(
          `student_id,
           student:profiles!educator_student_links_student_id_fkey(display_name, avatar_url)`,
        )
        .eq('educator_id', user.id)

      if (cancelled) return
      if (linksErr) {
        setError(linksErr.message)
        setLoading(false)
        return
      }

      // Supabase returns the joined profile as an array even for FK-to-one joins
      const rows = (links ?? []) as Array<{
        student_id: string
        student: Array<{ display_name: string | null; avatar_url: string | null }> | null
      }>

      if (rows.length === 0) {
        setStudents([])
        setLoading(false)
        return
      }

      const studentIds = rows.map((r) => r.student_id)

      // Step 2: fetch their epistemic profiles (educator read policy allows this)
      const { data: profiles, error: profilesErr } = await supabase
        .from('epistemic_profiles')
        .select('*')
        .in('user_id', studentIds)

      if (cancelled) return
      if (profilesErr) {
        setError(profilesErr.message)
        setLoading(false)
        return
      }

      const profileMap = new Map(
        ((profiles ?? []) as CognitiveProfile[]).map((p) => [p.user_id, p]),
      )

      setStudents(
        rows.map((r) => ({
          student_id: r.student_id,
          display_name: r.student?.[0]?.display_name ?? null,
          avatar_url: r.student?.[0]?.avatar_url ?? null,
          profile: profileMap.get(r.student_id) ?? null,
        })),
      )
      setLoading(false)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  return { students, loading, error }
}
