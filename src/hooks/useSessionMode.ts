import { useState } from 'react'

export type SessionMode = 'review' | 'standard' | 'challenge' | 'mastery_check'

/**
 * AGY-02: Session Mode Hook
 * Manages the selected session mode and derives starting state / skip states.
 * State is local only — chosen fresh each session.
 */
export function useSessionMode(): {
  mode: SessionMode
  setMode: (mode: SessionMode) => void
  startingState: string
  skipStates: string[]
} {
  const [mode, setMode] = useState<SessionMode>('standard')

  let startingState: string
  let skipStates: string[]

  switch (mode) {
    case 'review':
      startingState = 'REVISE'
      skipStates = ['ROOT', 'REGULATE', 'POSITION', 'PLAN', 'APPLY']
      break
    case 'challenge':
      startingState = 'APPLY'
      skipStates = ['ROOT', 'REGULATE', 'POSITION', 'PLAN']
      break
    case 'mastery_check':
      startingState = 'DEFEND'
      skipStates = ['ROOT', 'REGULATE', 'POSITION', 'PLAN', 'APPLY', 'REVISE']
      break
    case 'standard':
    default:
      startingState = 'ROOT'
      skipStates = []
      break
  }

  return { mode, setMode, startingState, skipStates }
}
