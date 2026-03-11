import { useEffect, useState } from 'react'
import type { DiagnosticContext } from '../../hooks/useSessionDiagnostic'

interface DiagnosticBannerProps {
  diagnostic: DiagnosticContext
}

function getBannerMessage(diagnostic: DiagnosticContext): string {
  if (diagnostic.isFirstSession) {
    return "Welcome! We'll start gently and adapt as you go."
  }
  if (
    diagnostic.weakestTraceRaw !== null &&
    diagnostic.weakestTraceScore !== null &&
    diagnostic.weakestTraceScore < 5
  ) {
    const dimName =
      diagnostic.weakestTraceRaw.charAt(0).toUpperCase() + diagnostic.weakestTraceRaw.slice(1)
    return `Focus area today: ${dimName}`
  }
  if (diagnostic.masteryScore > 0.8) {
    return "You're doing great — let's push a little further today."
  }
  return "Ready when you are. Take a breath and let's begin."
}

/**
 * DiagnosticBanner — shows a brief personalised message at session start.
 * Dismisses after 4 seconds or on click.
 */
export function DiagnosticBanner({ diagnostic }: DiagnosticBannerProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  const message = getBannerMessage(diagnostic)

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Session diagnostic message"
      className="flex items-center justify-between rounded-lg border border-brand-200 bg-brand-50 px-4 py-2 text-sm text-brand-800 shadow-sm transition-opacity"
    >
      <span>{message}</span>
      <button
        type="button"
        aria-label="Dismiss banner"
        className="ml-4 text-brand-500 hover:text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-1"
        onClick={() => setVisible(false)}
      >
        ✕
      </button>
    </div>
  )
}
