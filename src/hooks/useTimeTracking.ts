import { useEffect, useRef, useCallback } from 'react'

/**
 * Tracks time spent on a page/component. Returns elapsed seconds.
 * Pauses when the tab is hidden (document.hidden).
 */
export function useTimeTracking() {
  const startRef = useRef<number>(0)
  const elapsedRef = useRef(0)

  useEffect(() => {
    startRef.current = Date.now()

    const handleVisibilityChange = () => {
      if (document.hidden) {
        elapsedRef.current += Math.floor((Date.now() - startRef.current) / 1000)
      } else {
        startRef.current = Date.now()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const getElapsedSeconds = useCallback(() => {
    const current = document.hidden ? 0 : Math.floor((Date.now() - startRef.current) / 1000)
    return elapsedRef.current + current
  }, [])

  return { getElapsedSeconds }
}
