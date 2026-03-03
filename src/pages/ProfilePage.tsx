import { useState } from 'react'
import { useProfile } from '../hooks/useProfile'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import { Alert } from '../components/ui/Alert'
import type { LearningStyle } from '../types/profile'

const LEARNING_STYLES: LearningStyle[] = ['visual', 'auditory', 'kinesthetic', 'reading']

export function ProfilePage() {
  const { profile, loading, error, updateProfile } = useProfile()
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
    </main>
  )
}
