import { useState } from 'react'
import { useProfile } from '../hooks/useProfile'
import { useCognitiveProfile } from '../hooks/useCognitiveProfile'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import { Alert } from '../components/ui/Alert'
import type { LearningStyle } from '../types/profile'
import type { TraceFluency } from '../lib/raca/types/epistemic'

const LEARNING_STYLES: LearningStyle[] = ['visual', 'auditory', 'kinesthetic', 'reading']

type TraceDim = keyof Omit<TraceFluency, 'overall'>

const TRACE_DIMS: Array<{ key: TraceDim; label: string; desc: string }> = [
  { key: 'think', label: 'Think', desc: 'Pause quality before responding' },
  { key: 'reason', label: 'Reason', desc: 'Explicit reasoning moves' },
  { key: 'articulate', label: 'Articulate', desc: 'Clarity of expression' },
  { key: 'check', label: 'Check', desc: 'Self-correction depth' },
  { key: 'extend', label: 'Extend', desc: 'Connecting to broader ideas' },
  { key: 'ethical', label: 'Ethical', desc: 'Ethical reasoning markers' },
]

const TRAJECTORY_META = {
  emerging: { label: 'Emerging', badge: 'bg-slate-100 text-slate-700' },
  developing: { label: 'Developing', badge: 'bg-amber-100 text-amber-800' },
  proficient: { label: 'Proficient', badge: 'bg-emerald-100 text-emerald-800' },
}

function TraceDimensionBar({ label, desc, score }: { label: string; desc: string; score: number }) {
  const pct = Math.round((score / 10) * 100)
  const barColor = score >= 7 ? 'bg-emerald-500' : score >= 4 ? 'bg-amber-400' : 'bg-slate-300'
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="text-xs font-semibold text-slate-700">{label}</span>
          <span className="ml-2 text-xs text-slate-400">{desc}</span>
        </div>
        <span className="text-xs font-bold text-slate-600">{score}/10</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function ProfilePage() {
  const { profile, loading, error, updateProfile } = useProfile()
  const { cognitiveProfile, loading: lcpLoading } = useCognitiveProfile()
  const [editing, setEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [selectedStyles, setSelectedStyles] = useState<LearningStyle[]>([])
  const [saving, setSaving] = useState(false)

  const startEdit = () => {
    setDisplayName(profile?.display_name ?? '')
    setSelectedStyles(profile?.learning_styles ?? [])
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile({ display_name: displayName, learning_styles: selectedStyles })
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const toggleStyle = (style: LearningStyle) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style],
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
        {!editing && (
          <Button variant="secondary" onClick={startEdit}>
            Edit
          </Button>
        )}
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {editing ? (
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <Input
            label="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />

          <fieldset>
            <legend className="text-sm font-medium text-slate-700">Learning styles</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {LEARNING_STYLES.map((style) => (
                <label key={style} className="inline-flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={selectedStyles.includes(style)}
                    onChange={() => toggleStyle(style)}
                  />
                  {style}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
            <Button variant="secondary" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </section>
      ) : (
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-slate-500">Display name</dt>
              <dd className="font-semibold text-slate-900">{profile?.display_name || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Role</dt>
              <dd className="font-semibold text-slate-900">
                <Badge>{profile?.role ?? 'learner'}</Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Learning styles</dt>
              <dd className="font-semibold text-slate-900">
                {profile?.learning_styles?.length ? profile.learning_styles.join(', ') : 'Not set'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Current streak</dt>
              <dd className="font-semibold text-slate-900">{profile?.streak_days ?? 0} days</dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Completed lessons</dt>
              <dd className="font-semibold text-slate-900">{profile?.lessons_completed ?? 0}</dd>
            </div>
          </dl>
        </section>
      )}

      {/* Learner Cognitive Profile — spec §XII */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Cognitive Growth</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Built from your deep learning sessions — these are growth signals, not grades.
            </p>
          </div>
          {cognitiveProfile && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${TRAJECTORY_META[cognitiveProfile.growth_trajectory].badge}`}
            >
              {TRAJECTORY_META[cognitiveProfile.growth_trajectory].label}
            </span>
          )}
        </div>

        {lcpLoading ? (
          <Spinner />
        ) : cognitiveProfile ? (
          <div className="space-y-4">
            {/* TRACE dimension bars */}
            <div className="space-y-3">
              {TRACE_DIMS.map(({ key, label, desc }) => (
                <TraceDimensionBar
                  key={key}
                  label={label}
                  desc={desc}
                  score={cognitiveProfile.trace_averages[key] ?? 0}
                />
              ))}
            </div>

            {/* Session stats */}
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-4">
              <div className="text-center">
                <p className="text-xl font-bold text-slate-900">{cognitiveProfile.session_count}</p>
                <p className="text-xs text-slate-500">Sessions</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-slate-900">
                  {Math.round(cognitiveProfile.revision_frequency * 100)}%
                </p>
                <p className="text-xs text-slate-500">Revised work</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-slate-900">
                  {Math.round(cognitiveProfile.reflection_depth_avg)}
                </p>
                <p className="text-xs text-slate-500">Avg reflection words</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-slate-900">
                  {Math.round(cognitiveProfile.trace_averages.overall * 10) / 10}
                </p>
                <p className="text-xs text-slate-500">TRACE score</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-4">
            Complete a deep learning session to begin building your cognitive profile.
          </p>
        )}
      </section>
    </main>
  )
}
