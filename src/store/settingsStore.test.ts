import { describe, expect, it, beforeEach, vi } from 'vitest'

// Mock localStorage for zustand persist middleware
const storage: Record<string, string> = {}
vi.stubGlobal('localStorage', {
  getItem: (key: string) => storage[key] ?? null,
  setItem: (key: string, value: string) => {
    storage[key] = value
  },
  removeItem: (key: string) => {
    delete storage[key]
  },
})

// Import after mock is set up
const { useSettingsStore } = await import('./settingsStore')

describe('useSettingsStore', () => {
  beforeEach(() => {
    useSettingsStore.getState().reset()
  })

  it('updates accessibility preferences', () => {
    useSettingsStore.getState().updateAccessibility({ text_size: 'large' })

    const state = useSettingsStore.getState()
    expect(state.accessibility.text_size).toBe('large')
    expect(state.accessibility.reduce_motion).toBe(true)
  })

  it('resets to defaults', () => {
    useSettingsStore.getState().updateAccessibility({ text_size: 'large' })
    useSettingsStore.getState().reset()

    const state = useSettingsStore.getState()
    expect(state.accessibility.text_size).toBe('medium')
  })
})
