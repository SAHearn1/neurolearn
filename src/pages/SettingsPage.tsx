import { useState, type FormEvent } from 'react'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { useSettings } from '../hooks/useSettings'

export function SettingsPage() {
  const { reduceMotion, setReduceMotion, setTextSize, textSize } = useSettings()
  const [saved, setSaved] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaved(true)
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-6">
      <h1 className="text-3xl font-bold text-slate-900">Settings</h1>

      <form className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-slate-700">
          Preferred text size
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            onChange={(event) => {
              setTextSize(event.target.value as 'small' | 'medium' | 'large')
              setSaved(false)
            }}
            value={textSize}
          >
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </label>

        <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            checked={reduceMotion}
            className="h-4 w-4"
            onChange={(event) => {
              setReduceMotion(event.target.checked)
              setSaved(false)
            }}
            type="checkbox"
          />
          Reduce motion
        </label>

        <Button type="submit">Save preferences</Button>

        {saved ? <Alert variant="success">Preferences saved.</Alert> : null}
      </form>
    </main>
  )
}
