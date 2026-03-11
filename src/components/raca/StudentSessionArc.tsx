// src/components/raca/StudentSessionArc.tsx
// AGY-03: Agent Orchestration Bus — Student-facing session arc visualization
//
// Shows 9 cognitive-state waypoints connected by lines so the learner can
// see where they are and how far they have come.

import { COGNITIVE_STATES, STUDENT_STATE_LABELS } from '../../lib/raca/types/cognitive-states'
import { useSettingsStore } from '../../store/settingsStore'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  currentState: string
  completedStates: string[]
}

// ---------------------------------------------------------------------------
// Waypoint component
// ---------------------------------------------------------------------------

interface WaypointProps {
  state: string
  isCompleted: boolean
  isCurrent: boolean
  reduceMotion: boolean
}

function Waypoint({ state, isCompleted, isCurrent, reduceMotion }: WaypointProps) {
  const label = STUDENT_STATE_LABELS[state]?.label ?? state

  let circleClasses: string
  if (isCompleted) {
    circleClasses = 'bg-brand-500 border-brand-500'
  } else if (isCurrent) {
    circleClasses = reduceMotion
      ? 'bg-white border-brand-500 border-2'
      : 'bg-white border-brand-500 border-2 animate-pulse'
  } else {
    circleClasses = 'bg-white border-slate-200'
  }

  const ariaLabel = isCompleted
    ? `${label} — completed`
    : isCurrent
      ? `${label} — current state`
      : `${label} — upcoming`

  return (
    <li
      aria-label={ariaLabel}
      aria-current={isCurrent ? 'step' : undefined}
      className="flex flex-col items-center gap-1.5"
    >
      {/* Circle indicator */}
      <div
        className={[
          'h-5 w-5 rounded-full border-2 transition-colors duration-300',
          circleClasses,
        ].join(' ')}
        aria-hidden="true"
      >
        {isCompleted && (
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-full w-full text-white"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L9 11.586l6.293-6.293a1 1 0 011.414 0z"
            />
          </svg>
        )}
      </div>

      {/* Label */}
      <span
        className={[
          'text-center text-xs leading-tight',
          isCompleted
            ? 'font-medium text-brand-700'
            : isCurrent
              ? 'font-semibold text-slate-800'
              : 'text-slate-400',
        ].join(' ')}
      >
        {label}
      </span>
    </li>
  )
}

// ---------------------------------------------------------------------------
// Connector line between waypoints
// ---------------------------------------------------------------------------

interface ConnectorProps {
  isCompleted: boolean
}

function Connector({ isCompleted }: ConnectorProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        'mx-0.5 mt-2 h-0.5 flex-1 self-start transition-colors duration-300',
        isCompleted ? 'bg-brand-500' : 'bg-slate-200',
      ].join(' ')}
    />
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function StudentSessionArc({ currentState, completedStates }: Props) {
  const reduceMotion = useSettingsStore((s) => s.accessibility.reduce_motion)
  const completedSet = new Set(completedStates)

  return (
    <nav aria-label="Session progress" className="w-full">
      {/* Desktop: horizontal row */}
      <ol className="hidden items-start sm:flex" aria-label="Cognitive state progress">
        {COGNITIVE_STATES.map((state, index) => {
          const isCompleted = completedSet.has(state)
          const isCurrent = state === currentState
          const isLast = index === COGNITIVE_STATES.length - 1

          return (
            <li key={state} className="flex flex-1 items-start" role="presentation">
              {/* Waypoint */}
              <Waypoint
                state={state}
                isCompleted={isCompleted}
                isCurrent={isCurrent}
                reduceMotion={reduceMotion}
              />
              {/* Connector (not after last item) */}
              {!isLast && <Connector isCompleted={isCompleted} />}
            </li>
          )
        })}
      </ol>

      {/* Mobile: 3-column grid */}
      <ol
        className="grid grid-cols-3 gap-x-4 gap-y-4 sm:hidden"
        aria-label="Cognitive state progress"
      >
        {COGNITIVE_STATES.map((state) => {
          const isCompleted = completedSet.has(state)
          const isCurrent = state === currentState

          return (
            <Waypoint
              key={state}
              state={state}
              isCompleted={isCompleted}
              isCurrent={isCurrent}
              reduceMotion={reduceMotion}
            />
          )
        })}
      </ol>
    </nav>
  )
}
