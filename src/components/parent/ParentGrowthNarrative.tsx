import { useEffect, useState } from 'react'
import { supabase } from '../../../utils/supabase/client'
import { TraceBars } from '../ui/TraceBars'
import { Spinner } from '../ui/Spinner'
import { Alert } from '../ui/Alert'
import type { CognitiveProfile } from '../../lib/raca/types/epistemic'

interface StudentGrowthData {
  student_id: string
  display_name: string | null
  profile: CognitiveProfile | null
}

const TRAJECTORY_META = {
  emerging: { label: 'Emerging', emoji: '🌱', badge: 'bg-slate-100 text-slate-700' },
  developing: { label: 'Developing', emoji: '📈', badge: 'bg-amber-100 text-amber-800' },
  proficient: { label: 'Proficient', emoji: '⭐', badge: 'bg-emerald-100 text-emerald-800' },
} as const

interface ParentGrowthNarrativeProps {
  studentIds: string[]
  studentNames: Record<string, string | null>
}

/**
 * REQ-18-07 — Parent Growth Narrative View.
 * Read-only LCP summary with trajectory badge and TRACE overview for each linked child.
 */
export function ParentGrowthNarrative({ studentIds, studentNames }: ParentGrowthNarrativeProps) {
  const [students, setStudents] = useState<StudentGrowthData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (studentIds.length === 0) return

    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('epistemic_profiles')
        .select('*')
        .in('user_id', studentIds)

      if (cancelled) return
      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      const profileMap = new Map(((data ?? []) as CognitiveProfile[]).map((p) => [p.user_id, p]))

      setStudents(
        studentIds.map((id) => ({
          student_id: id,
          display_name: studentNames[id] ?? null,
          profile: profileMap.get(id) ?? null,
        })),
      )
      setLoading(false)
    }

    run()
    return () => {
      cancelled = true
    }
  }, [studentIds, studentNames])

  if (studentIds.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
        <p className="text-2xl">🧠</p>
        <p className="mt-2 font-semibold text-slate-700">No linked students</p>
        <p className="mt-1 text-sm text-slate-500">
          Link your child's account in the My Students tab to see their growth profile.
        </p>
      </div>
    )
  }

  if (loading) return <Spinner />
  if (error) return <Alert variant="error">{error}</Alert>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Cognitive Growth</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          These are growth signals from deep learning sessions — not grades or diagnoses.
        </p>
      </div>

      {students.map(({ student_id, display_name, profile }) => (
        <div key={student_id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">{display_name ?? 'Your child'}</h3>
              {profile && (
                <p className="text-xs text-slate-500">
                  {profile.session_count} deep session{profile.session_count !== 1 ? 's' : ''}{' '}
                  completed
                </p>
              )}
            </div>
            {profile ? (
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${TRAJECTORY_META[profile.growth_trajectory].badge}`}
              >
                {TRAJECTORY_META[profile.growth_trajectory].emoji}{' '}
                {TRAJECTORY_META[profile.growth_trajectory].label}
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                Not started
              </span>
            )}
          </div>

          {profile ? (
            <>
              <TraceBars traceAverages={profile.trace_averages} />

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-4 text-center text-sm sm:grid-cols-4">
                <div>
                  <p className="text-xl font-bold text-slate-900">
                    {Math.round(profile.trace_averages.overall * 10) / 10}
                  </p>
                  <p className="text-xs text-slate-500">TRACE score</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">
                    {Math.round(profile.revision_frequency * 100)}%
                  </p>
                  <p className="text-xs text-slate-500">Revised work</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">
                    {Math.round(profile.reflection_depth_avg)}
                  </p>
                  <p className="text-xs text-slate-500">Avg reflection words</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">
                    {Math.round(profile.defense_strength_avg)}
                  </p>
                  <p className="text-xs text-slate-500">Avg defense words</p>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-400">
                TRACE measures six thinking skills: reasoning, articulation, self-checking,
                idea-connecting, ethical awareness, and reflective pausing.
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400">
              No deep learning sessions yet. The profile builds after completing the first RACA
              session.
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
