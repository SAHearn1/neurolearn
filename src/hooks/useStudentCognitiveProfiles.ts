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

      // Step 1: get linked student IDs
      const { data: links, error: linksErr } = await supabase
        .from('educator_student_links')
        .select('student_id')
        .eq('educator_id', user.id)

      if (cancelled) return
      if (linksErr) {
        setError(linksErr.message)
        setLoading(false)
        return
      }

      const studentIds = (links ?? []).map((r: { student_id: string }) => r.student_id)

      if (studentIds.length === 0) {
        setStudents([])
        setLoading(false)
        return
      }

      // Step 1b: fetch display names from profiles using user_id
      const { data: profileRows, error: profileRowsErr } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', studentIds)

      if (cancelled) return
      if (profileRowsErr) {
        setError(profileRowsErr.message)
        setLoading(false)
        return
      }

      const displayNameMap = new Map(
        (
          (profileRows ?? []) as Array<{
            user_id: string
            display_name: string | null
            avatar_url: string | null
          }>
        ).map((p) => [p.user_id, p]),
      )

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
        studentIds.map((id) => ({
          student_id: id,
          display_name: displayNameMap.get(id)?.display_name ?? null,
          avatar_url: displayNameMap.get(id)?.avatar_url ?? null,
          profile: profileMap.get(id) ?? null,
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
