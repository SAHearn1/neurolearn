import { create } from 'zustand'

interface SettingsState {
  reduceMotion: boolean
  setReduceMotion: (value: boolean) => void
  textSize: 'small' | 'medium' | 'large'
  setTextSize: (value: 'small' | 'medium' | 'large') => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  reduceMotion: false,
  setReduceMotion: (value) => set({ reduceMotion: value }),
  setTextSize: (value) => set({ textSize: value }),
  textSize: 'medium',
}))
