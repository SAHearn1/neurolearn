import { useState, useEffect } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import { useProfile } from '../hooks/useProfile'
import { Alert } from '../components/ui/Alert'
import { Badge } from '../components/ui/Badge'

export function SettingsPage() {
  const { accessibility, updateAccessibility } = useSettingsStore()
  const { profile, updateProfile } = useProfile()

  const [textSize, setTextSize] = useState(accessibility.text_size)
  const [reduceMotion, setReduceMotion] = useState(accessibility.reduce_motion)
  const [highContrast, setHighContrast] = useState(accessibility.high_contrast)
  const [screenReaderHints, setScreenReaderHints] = useState(accessibility.screen_reader_hints)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // Sync form from profile on first load so DB values win over localStorage
  useEffect(() => {
    if (profile?.accessibility) {
      setTextSize(profile.accessibility.text_size)
      setReduceMotion(profile.accessibility.reduce_motion)
      setHighContrast(profile.accessibility.high_contrast)
      setScreenReaderHints(profile.accessibility.screen_reader_hints)
    }
  }, [profile?.accessibility])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaveError(null)
    setSaved(false)
    setSaving(true)

    const prefs = {
      text_size: textSize,
      reduce_motion: reduceMotion,
      high_contrast: highContrast,
      screen_reader_hints: screenReaderHints,
    } as const

    try {
      updateAccessibility(prefs)
      await updateProfile({ accessibility: prefs })
      setSaved(true)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main id="main-content" className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <Badge>Settings</Badge>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600">Manage your accessibility and display preferences.</p>
      </header>

      {saveError && <Alert variant="error">{saveError}</Alert>}
      {saved && <Alert variant="info">Preferences saved successfully.</Alert>}

      <form
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Accessibility</h2>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Preferred text size
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
                value={textSize}
                onChange={(e) => setTextSize(e.target.value as typeof textSize)}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </label>

            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
              <input
                className="h-4 w-4"
                type="checkbox"
                checked={reduceMotion}
                onChange={(e) => setReduceMotion(e.target.checked)}
              />
              Reduce motion
            </label>

            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
              <input
                className="h-4 w-4"
                type="checkbox"
                checked={highContrast}
                onChange={(e) => setHighContrast(e.target.checked)}
              />
              High contrast
            </label>

            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
              <input
                className="h-4 w-4"
                type="checkbox"
                checked={screenReaderHints}
                onChange={(e) => setScreenReaderHints(e.target.checked)}
              />
              Screen reader hints
            </label>
          </div>
        </div>

        <button
          className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
          disabled={saving}
          type="submit"
        >
          {saving ? 'Saving…' : 'Save preferences'}
        </button>
      </form>
    </main>
  )
}
