import { useState, useCallback } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Alert } from '../ui/Alert'
import { Spinner } from '../ui/Spinner'
import { useParentProfile } from '../../hooks/useParentProfile'
import type { ContactPreference, NotificationFrequency } from '../../types/parent'

export function ParentNotificationPrefs() {
  const { profile, loading, error, upsertProfile } = useParentProfile()
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const [contactPref, setContactPref] = useState<ContactPreference>(
    profile?.contact_preference ?? 'email',
  )
  const [frequency, setFrequency] = useState<NotificationFrequency>(
    profile?.notification_frequency ?? 'weekly',
  )

  const handleSave = useCallback(async () => {
    setSaving(true)
    setSaveError(null)
    setSaved(false)
    try {
      await upsertProfile({
        contact_preference: contactPref,
        notification_frequency: frequency,
      })
      setSaved(true)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }, [contactPref, frequency, upsertProfile])

  if (loading) return <Spinner />
  if (error) return <Alert variant="error">{error}</Alert>

  const contactOptions: { value: ContactPreference; label: string }[] = [
    { value: 'email', label: 'Email only' },
    { value: 'phone', label: 'Phone only' },
    { value: 'both', label: 'Email & Phone' },
    { value: 'none', label: 'None' },
  ]

  const frequencyOptions: { value: NotificationFrequency; label: string }[] = [
    { value: 'immediate', label: 'Immediate' },
    { value: 'daily', label: 'Daily digest' },
    { value: 'weekly', label: 'Weekly summary' },
    { value: 'monthly', label: 'Monthly overview' },
  ]

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900">Notification Preferences</h2>

      <Card>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Contact Preference</p>
            <div className="flex flex-wrap gap-2">
              {contactOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    contactPref === opt.value
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  onClick={() => setContactPref(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Notification Frequency</p>
            <div className="flex flex-wrap gap-2">
              {frequencyOptions.map((opt) => (
                <button
                  key={opt.value}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    frequency === opt.value
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  onClick={() => setFrequency(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {saveError && <Alert variant="error">{saveError}</Alert>}
          {saved && <Alert variant="success">Preferences saved successfully.</Alert>}

          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </Card>
    </section>
  )
}
