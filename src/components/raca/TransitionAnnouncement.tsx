// src/components/raca/TransitionAnnouncement.tsx
// AGY-03: Agent Orchestration Bus — Cognitive state transition overlay
//
// Shown for 2 seconds when the cognitive state transitions:
// fade-in 0.2s → hold 1.6s → fade-out 0.2s.
// If reduce_motion is active: no visual overlay, aria-live only.

import { useEffect, useRef } from 'react'
import { STUDENT_STATE_LABELS } from '../../lib/raca/types/cognitive-states'
import { useSettingsStore } from '../../store/settingsStore'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  toState: string
  visible: boolean
  onDone: () => void
}

// ---------------------------------------------------------------------------
// Timing constants (ms)
// ---------------------------------------------------------------------------

const FADE_IN_MS = 200
const HOLD_MS = 1600
const FADE_OUT_MS = 200
const TOTAL_MS = FADE_IN_MS + HOLD_MS + FADE_OUT_MS // 2000

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TransitionAnnouncement({ toState, visible, onDone }: Props) {
  const reduceMotion = useSettingsStore((s) => s.accessibility.reduce_motion)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stateLabel = STUDENT_STATE_LABELS[toState]

  // Fire the onDone callback after TOTAL_MS when visible becomes true
  useEffect(() => {
    if (!visible) return

    timerRef.current = setTimeout(() => {
      onDone()
    }, TOTAL_MS)

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
    }
  }, [visible, onDone])

  // Always render the aria-live region so screen readers pick up the
  // announcement even in reduce_motion mode.
  const announcement =
    visible && stateLabel ? `Moving to: ${stateLabel.label}. ${stateLabel.description}` : ''

  if (reduceMotion) {
    // No visual overlay in reduce-motion mode — aria-live only
    return (
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
    )
  }

  if (!visible || !stateLabel) {
    return (
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {/* announcement text lives here when not animating */}
      </div>
    )
  }

  return (
    <>
      {/* Screen reader announcement */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {/* Visual overlay */}
      <div
        className={[
          'fixed inset-0 z-50 flex items-center justify-center',
          'bg-slate-900/60',
          'animate-transition-overlay', // see tailwind config for keyframes
        ].join(' ')}
        aria-hidden="true"
        style={{
          animation: `transitionOverlay ${TOTAL_MS}ms ease-in-out forwards`,
        }}
      >
        <div className="mx-4 max-w-sm rounded-2xl bg-white px-8 py-6 text-center shadow-2xl">
          <p className="mb-1 text-2xl font-bold text-slate-800">{stateLabel.label}</p>
          <p className="text-base text-slate-500">{stateLabel.description}</p>
        </div>
      </div>

      {/* Inline keyframes for the overlay animation */}
      <style>{`
        @keyframes transitionOverlay {
          0%   { opacity: 0; }
          ${((FADE_IN_MS / TOTAL_MS) * 100).toFixed(1)}%  { opacity: 1; }
          ${(((FADE_IN_MS + HOLD_MS) / TOTAL_MS) * 100).toFixed(1)}% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </>
  )
}
