import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AccessibilityPreferences } from '../types/profile'

interface SettingsState {
  accessibility: AccessibilityPreferences
  updateAccessibility: (prefs: Partial<AccessibilityPreferences>) => void
  reset: () => void
}

const defaults: AccessibilityPreferences = {
  text_size: 'medium',
  reduce_motion: true,
  high_contrast: false,
  screen_reader_hints: false,
  dyslexia_font: false,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      accessibility: { ...defaults },

      updateAccessibility: (prefs) =>
        set((state) => ({
          accessibility: { ...state.accessibility, ...prefs },
        })),

      reset: () => set({ accessibility: { ...defaults } }),
    }),
    { name: 'neurolearn.settings' },
  ),
)
