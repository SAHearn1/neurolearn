import { useEffect } from 'react'

export function useKeyboardNavigation() {
  useEffect(() => {
    function handleFirstTab(event: KeyboardEvent) {
      if (event.key === 'Tab') {
        document.documentElement.classList.add('keyboard-nav')
        document.removeEventListener('keydown', handleFirstTab)
        document.addEventListener('mousedown', handleFirstMouse)
      }
    }

    function handleFirstMouse() {
      document.documentElement.classList.remove('keyboard-nav')
      document.removeEventListener('mousedown', handleFirstMouse)
      document.addEventListener('keydown', handleFirstTab)
    }

    document.addEventListener('keydown', handleFirstTab)

    return () => {
      document.removeEventListener('keydown', handleFirstTab)
      document.removeEventListener('mousedown', handleFirstMouse)
    }
  }, [])
}

export function useSkipLink(targetId: string) {
  useEffect(() => {
    function handleSkip(event: KeyboardEvent) {
      if (event.key === 'Enter') {
        const target = document.getElementById(targetId)
        if (target && document.activeElement?.classList.contains('skip-link')) {
          event.preventDefault()
          target.focus()
          target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    }

    document.addEventListener('keydown', handleSkip)
    return () => document.removeEventListener('keydown', handleSkip)
  }, [targetId])
}

export function handleArrowNavigation(
  event: React.KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  orientation: 'horizontal' | 'vertical' = 'vertical',
): void {
  const prevKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'
  const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'

  if (event.key === prevKey) {
    event.preventDefault()
    const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1
    items[prev]?.focus()
  } else if (event.key === nextKey) {
    event.preventDefault()
    const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0
    items[next]?.focus()
  } else if (event.key === 'Home') {
    event.preventDefault()
    items[0]?.focus()
  } else if (event.key === 'End') {
    event.preventDefault()
    items[items.length - 1]?.focus()
  }
}
