import type { CognitiveState } from '../types/cognitive-states'
import type { RuntimeState } from '../layer0-runtime/runtime-reducer'

/**
 * Preconditions — enforce requirements before a state transition is allowed.
 * Each target state may have preconditions that must be satisfied.
 */

export interface PreconditionResult {
  met: boolean
  reason: string
}

type PreconditionFn = (state: RuntimeState) => PreconditionResult

const pass = (reason: string): PreconditionResult => ({ met: true, reason })
const fail = (reason: string): PreconditionResult => ({ met: false, reason })

const preconditionMap: Partial<Record<CognitiveState, PreconditionFn>> = {
  ROOT: () => pass('ROOT has no preconditions'),

  REGULATE: () => pass('REGULATE is always accessible'),

  POSITION: (state) => {
    if (state.regulation.level < 60) {
      return fail(`Regulation level ${state.regulation.level} is below 60`)
    }
    return pass('Regulation level sufficient')
  },

  PLAN: (state) => {
    const hasReflection = state.artifacts.some(
      (a) => a.kind === 'reflection' || a.kind === 'position_frame',
    )
    if (!hasReflection) {
      return fail('Reflection or position frame required before PLAN')
    }
    return pass('Reflection exists')
  },

  APPLY: (state) => {
    const hasPlan = state.artifacts.some((a) => a.kind === 'plan_outline')
    if (!hasPlan) {
      return fail('Plan outline required before APPLY')
    }
    return pass('Plan outline exists')
  },

  REVISE: (state) => {
    const hasDraft = state.artifacts.some((a) => a.kind === 'draft')
    if (!hasDraft) {
      return fail('Draft artifact required before REVISE')
    }
    return pass('Draft exists')
  },

  DEFEND: (state) => {
    const hasRevision = state.artifacts.some((a) => a.kind === 'revision')
    if (!hasRevision) {
      return fail('Revision artifact required before DEFEND')
    }
    return pass('Revision exists')
  },

  RECONNECT: (state) => {
    const hasDefense = state.artifacts.some((a) => a.kind === 'defense_response')
    if (!hasDefense) {
      return fail('Defense response required before RECONNECT')
    }
    return pass('Defense response exists')
  },

  ARCHIVE: (state) => {
    const hasReconnection = state.artifacts.some((a) => a.kind === 'reconnection_reflection')
    if (!hasReconnection) {
      return fail('Reconnection reflection required before ARCHIVE')
    }
    return pass('Reconnection reflection exists')
  },
}

export function checkPrecondition(
  targetState: CognitiveState,
  runtimeState: RuntimeState,
): PreconditionResult {
  const check = preconditionMap[targetState]
  if (!check) return pass('No preconditions')
  return check(runtimeState)
}
