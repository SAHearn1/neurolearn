import { useState } from 'react'
import { useSettingsStore } from '../store/settingsStore'
import { getSupabaseClient } from '../../utils/supabase/client'

export function useSettings() {
  const { reduceMotion, setReduceMotion, setTextSize, textSize } = useSettingsStore()
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  function clearStatus() {
    setSettingsError(null)
    setSettingsMessage(null)
  }

  async function saveSettings(userId?: string | null) {
    clearStatus()

    if (!userId || userId === 'demo-user') {
      setSettingsMessage('Preferences saved locally for this session.')
      return true
    }

    const supabase = getSupabaseClient()
    if (!supabase) {
      setSettingsMessage('Preferences saved locally. Connect Supabase variables to persist remotely.')
      return true
    }

    setIsSaving(true)
    const { error } = await (supabase as any).from('profiles').upsert(
      {
        id: userId,
        sensory_preferences: {
          fontSize: textSize,
          reduceMotion,
        },
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
    setIsSaving(false)

    if (error) {
      setSettingsError(error.message)
      return false
    }

    setSettingsMessage('Preferences saved and synced.')
    return true
  }

  return {
    clearStatus,
    isSaving,
    reduceMotion,
    saveSettings,
    setReduceMotion,
    setTextSize,
    settingsError,
    settingsMessage,
    textSize,
  }
}
