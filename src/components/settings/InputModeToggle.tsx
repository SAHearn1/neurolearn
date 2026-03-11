import { useSettingsStore } from '../../store/settingsStore'

/**
 * ASS-03: Input Mode Toggle
 * Lets learners set their preferred input mode (text or voice) in settings.
 */
export function InputModeToggle() {
  const { accessibility, updateAccessibility } = useSettingsStore()
  const isVoice = accessibility.preferredInputMode === 'voice'

  const handleToggle = () => {
    updateAccessibility({ preferredInputMode: isVoice ? 'text' : 'voice' })
  }

  return (
    <div className="space-y-1">
      <label
        htmlFor="input-mode-toggle"
        className="flex items-center gap-2 text-sm font-medium text-slate-700"
      >
        <input
          id="input-mode-toggle"
          type="checkbox"
          role="switch"
          aria-checked={isVoice}
          checked={isVoice}
          onChange={handleToggle}
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        🎤 Prefer voice input
      </label>
      <p className="ml-6 text-xs text-slate-500">Requires microphone permission</p>
    </div>
  )
}
