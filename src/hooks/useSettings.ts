import { useSettingsStore } from '../store/settingsStore'
import type { AccessibilityPreferences } from '../types/profile'

export function useSettings() {
  const accessibility = useSettingsStore((s) => s.accessibility)
  const updateAccessibility = useSettingsStore((s) => s.updateAccessibility)
  const reset = useSettingsStore((s) => s.reset)

  return {
    accessibility,
    updateAccessibility: (prefs: Partial<AccessibilityPreferences>) => updateAccessibility(prefs),
    resetToDefaults: reset,
  }
}
