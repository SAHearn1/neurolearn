import { describe, expect, it } from 'vitest'
import { useSettingsStore } from './settingsStore'

describe('useSettingsStore', () => {
  it('updates text size and motion preference', () => {
    useSettingsStore.setState({ reduceMotion: false, textSize: 'medium' })

    useSettingsStore.getState().setTextSize('large')
    useSettingsStore.getState().setReduceMotion(true)

    const state = useSettingsStore.getState()
    expect(state.textSize).toBe('large')
    expect(state.reduceMotion).toBe(true)
  })
})
