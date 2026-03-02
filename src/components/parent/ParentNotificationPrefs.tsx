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
  const [emailEnabled, setEmailEnabled] = useState(profile?.notification_email ?? true)
  const [pushEnabled, setPushEnabled] = useState(profile?.notification_push ?? false)

  const handleSave = useCallback(async () => {
    setSaving(true)
    setSaveError(null)
    setSaved(false)
    try {
      await upsertProfile({
        contact_preference: contactPref,
        notification_frequency: frequency,
        notification_email: emailEnabled,
        notification_push: pushEnabled,
      })
      setSaved(true)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }, [contactPref, frequency, emailEnabled, pushEnabled, upsertProfile])

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

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Notification Channels</p>
            <div className="space-y-2">
              <label htmlFor="email-toggle" className="flex items-center gap-3">
                <input
                  id="email-toggle"
                  type="checkbox"
                  checked={emailEnabled}
                  onChange={(e) => setEmailEnabled(e.target.checked)}
                  aria-describedby="email-toggle-desc"
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  disabled={saving}
                />
                <div>
                  <span className="text-sm font-medium text-slate-700">Email notifications</span>
                  <span id="email-toggle-desc" className="block text-xs text-slate-500">
                    Receive weekly progress summaries via email
                  </span>
                </div>
              </label>
              <label htmlFor="push-toggle" className="flex items-center gap-3">
                <input
                  id="push-toggle"
                  type="checkbox"
                  checked={pushEnabled}
                  onChange={(e) => setPushEnabled(e.target.checked)}
                  aria-describedby="push-toggle-desc"
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  disabled={saving}
                />
                <div>
                  <span className="text-sm font-medium text-slate-700">Push notifications</span>
                  <span id="push-toggle-desc" className="block text-xs text-slate-500">
                    Get real-time alerts on your device
                  </span>
                </div>
              </label>
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
