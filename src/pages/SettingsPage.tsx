import { useState, type FormEvent } from 'react'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../hooks/useAuth'
import { useSettings } from '../hooks/useSettings'

export function SettingsPage() {
  const { userId } = useAuth()
  const {
    clearStatus,
    isSaving,
    reduceMotion,
    saveSettings,
    setReduceMotion,
    setTextSize,
    settingsError,
    settingsMessage,
    textSize,
  } = useSettings()
  const { authError, authMessage, changePassword, clearError, clearMessage, isLoading } = useAuth()
  const [saved, setSaved] = useState(false)
  const [newPassword, setNewPassword] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaved(false)
    const ok = await saveSettings(userId)
    setSaved(ok)
  }

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearError()
    clearMessage()
    await changePassword(newPassword)
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
              clearStatus()
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
              clearStatus()
              setReduceMotion(event.target.checked)
              setSaved(false)
            }}
            type="checkbox"
          />
          Reduce motion
        </label>

        <Button disabled={isSaving} type="submit">
          {isSaving ? 'Saving…' : 'Save preferences'}
        </Button>

        {saved ? <Alert variant="success">Preferences saved.</Alert> : null}
        {settingsMessage ? <Alert>{settingsMessage}</Alert> : null}
        {settingsError ? <Alert variant="error">{settingsError}</Alert> : null}
      </form>

      <form className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handlePasswordChange}>
        <h2 className="text-xl font-semibold text-slate-900">Account security</h2>
        <Input
          label="New password"
          minLength={8}
          name="newPassword"
          onChange={(event) => setNewPassword(event.target.value)}
          placeholder="Enter a new password"
          required
          type="password"
          value={newPassword}
        />
        <Button disabled={isLoading} type="submit">
          {isLoading ? 'Updating password…' : 'Update password'}
        </Button>

        {authError ? <Alert variant="error">{authError}</Alert> : null}
        {authMessage ? <Alert variant="success">{authMessage}</Alert> : null}
      </form>
    </main>
  )
}
