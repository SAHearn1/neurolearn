import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, beforeEach } from 'vitest'
import { useSettingsStore } from '../store/settingsStore'
import { useSettings } from './useSettings'

beforeEach(() => {
  useSettingsStore.setState({
    accessibility: {
      text_size: 'medium',
      reduce_motion: true,
      high_contrast: false,
      screen_reader_hints: false,
      dyslexia_font: false,
    },
  })
})

describe('useSettings', () => {
  it('returns current accessibility preferences', () => {
    const { result } = renderHook(() => useSettings())
    expect(result.current.accessibility.text_size).toBe('medium')
    expect(result.current.accessibility.high_contrast).toBe(false)
  })

  it('updateAccessibility merges partial preferences', () => {
    const { result } = renderHook(() => useSettings())
    act(() => {
      result.current.updateAccessibility({ high_contrast: true })
    })
    expect(result.current.accessibility.high_contrast).toBe(true)
    // other prefs unchanged
    expect(result.current.accessibility.text_size).toBe('medium')
  })

  it('resetToDefaults restores default preferences', () => {
    useSettingsStore.setState({
      accessibility: {
        text_size: 'large',
        reduce_motion: false,
        high_contrast: true,
        screen_reader_hints: true,
        dyslexia_font: true,
      },
    })
    const { result } = renderHook(() => useSettings())
    act(() => {
      result.current.resetToDefaults()
    })
    expect(result.current.accessibility.text_size).toBe('medium')
    expect(result.current.accessibility.high_contrast).toBe(false)
  })

  it('exposes updateAccessibility and resetToDefaults as functions', () => {
    const { result } = renderHook(() => useSettings())
    expect(typeof result.current.updateAccessibility).toBe('function')
    expect(typeof result.current.resetToDefaults).toBe('function')
  })
})
