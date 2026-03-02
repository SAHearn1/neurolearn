import { useEffect, useState } from 'react'
import { useSettingsStore } from '../store/settingsStore'

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useReducedMotion(): boolean {
  const appSetting = useSettingsStore((s) => s.accessibility.reduce_motion)
  const [osPreference, setOsPreference] = useState(prefersReducedMotion)

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e: MediaQueryListEvent) => setOsPreference(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return appSetting || osPreference
}

export function getTransitionClasses(reduceMotion: boolean): string {
  return reduceMotion ? '' : 'transition-all duration-200 ease-in-out'
}
