import { useSettingsStore } from '../store/settingsStore'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'
import { useState } from 'react'

export function SettingsPage() {
  const { accessibility, updateAccessibility, reset } = useSettingsStore()
  const [saved, setSaved] = useState(false)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-6"
    >
      <h1 className="text-3xl font-bold text-slate-900">Settings</h1>

      {saved && <Alert variant="success">Preferences saved.</Alert>}

      <form
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        onSubmit={handleSubmit}
      >
        <label className="block text-sm font-medium text-slate-700">
          Preferred text size
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={accessibility.text_size}
            onChange={(e) =>
              updateAccessibility({ text_size: e.target.value as 'small' | 'medium' | 'large' })
            }
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            className="h-4 w-4"
            type="checkbox"
            checked={accessibility.reduce_motion}
            onChange={(e) => updateAccessibility({ reduce_motion: e.target.checked })}
          />
          Reduce motion
        </label>

        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            className="h-4 w-4"
            type="checkbox"
            checked={accessibility.high_contrast}
            onChange={(e) => updateAccessibility({ high_contrast: e.target.checked })}
          />
          High contrast mode
        </label>

        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            className="h-4 w-4"
            type="checkbox"
            checked={accessibility.screen_reader_hints}
            onChange={(e) => updateAccessibility({ screen_reader_hints: e.target.checked })}
          />
          Screen reader hints
        </label>

        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            className="h-4 w-4"
            type="checkbox"
            checked={accessibility.dyslexia_font ?? false}
            onChange={(e) => updateAccessibility({ dyslexia_font: e.target.checked })}
          />
          Dyslexia-friendly font (OpenDyslexic)
        </label>

        <div className="flex gap-2 pt-2">
          <Button type="submit">Save preferences</Button>
          <Button variant="secondary" type="button" onClick={reset}>
            Reset to defaults
          </Button>
        </div>
      </form>
    </main>
  )
}
