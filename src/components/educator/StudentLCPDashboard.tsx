import { useStudentCognitiveProfiles } from '../../hooks/useStudentCognitiveProfiles'
import { TraceBars } from '../ui/TraceBars'
import { Spinner } from '../ui/Spinner'
import { Alert } from '../ui/Alert'

const TRAJECTORY_META = {
  emerging: { label: 'Emerging', badge: 'bg-slate-100 text-slate-700' },
  developing: { label: 'Developing', badge: 'bg-amber-100 text-amber-800' },
  proficient: { label: 'Proficient', badge: 'bg-emerald-100 text-emerald-800' },
} as const

/**
 * REQ-18-02 — Educator LCP Dashboard.
 * Shows per-student TRACE dimension bars, trajectory badge, and growth stats
 * for all students linked to this educator via educator_student_links.
 */
export function StudentLCPDashboard() {
  const { students, loading, error } = useStudentCognitiveProfiles()

  if (loading) return <Spinner />
  if (error) return <Alert variant="error">{error}</Alert>

  if (students.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
        <p className="text-2xl">🧠</p>
        <p className="mt-2 font-semibold text-slate-700">No linked students yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Link students in the Classes tab to see their cognitive growth profiles here.
        </p>
      </div>
    )
  }

  const withProfile = students.filter((s) => s.profile !== null)
  const withoutProfile = students.filter((s) => s.profile === null)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Student Cognitive Growth</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          TRACE fluency scores from deep learning sessions — growth signals, not grades.
        </p>
      </div>

      {withProfile.length === 0 && (
        <Alert variant="info">
          None of your linked students have completed a RACA session yet. Profiles appear after
          their first deep learning session.
        </Alert>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {withProfile.map(({ student_id, display_name, profile }) => {
          if (!profile) return null
          const traj = TRAJECTORY_META[profile.growth_trajectory]
          return (
            <div
              key={student_id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              {/* Header */}
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{display_name ?? 'Student'}</p>
                  <p className="text-xs text-slate-500">{profile.session_count} sessions</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${traj.badge}`}>
                  {traj.label}
                </span>
              </div>

              {/* TRACE bars */}
              <TraceBars traceAverages={profile.trace_averages} />

              {/* Mini stats */}
              <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3 text-center text-xs">
                <div>
                  <p className="font-bold text-slate-800">
                    {Math.round(profile.trace_averages.overall * 10) / 10}
                  </p>
                  <p className="text-slate-500">TRACE</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800">
                    {Math.round(profile.revision_frequency * 100)}%
                  </p>
                  <p className="text-slate-500">Revised</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800">
                    {Math.round(profile.reflection_depth_avg)}
                  </p>
                  <p className="text-slate-500">Reflect. words</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {withoutProfile.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            No sessions yet ({withoutProfile.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {withoutProfile.map(({ student_id, display_name }) => (
              <span
                key={student_id}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
              >
                {display_name ?? 'Student'}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
