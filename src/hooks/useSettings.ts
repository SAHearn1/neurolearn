import { useSettingsStore } from '../store/settingsStore'

export function useSettings() {
  const { reduceMotion, setReduceMotion, setTextSize, textSize } = useSettingsStore()

  return {
    reduceMotion,
    setReduceMotion,
    setTextSize,
    textSize,
  }
}
