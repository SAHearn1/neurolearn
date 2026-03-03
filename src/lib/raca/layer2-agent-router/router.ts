import type { AgentId } from '../types/agents'
import type { CognitiveState } from '../types/cognitive-states'
import type { RuntimeState } from '../layer0-runtime/runtime-reducer'
import { isAgentAllowedInState } from './state-agent-map'
import { getAgentDefinition } from './agent-registry'
import { racaFlags } from '../feature-flags'

/**
 * Agent Router — resolves whether an agent invocation is permitted
 * given the current cognitive state and runtime conditions.
 */

export interface RouteResult {
  allowed: boolean
  agentId: AgentId
  state: CognitiveState
  reason: string
}

export function routeAgentRequest(agentId: AgentId, runtimeState: RuntimeState): RouteResult {
  const state = runtimeState.current_state
  const base = { agentId, state }

  // Check feature flags
  if (!racaFlags.agentRouter) {
    return { ...base, allowed: false, reason: 'Agent router is disabled' }
  }

  if (!racaFlags.agents) {
    return { ...base, allowed: false, reason: 'Agents are disabled' }
  }

  // Check session is active
  if (runtimeState.status !== 'active') {
    return { ...base, allowed: false, reason: 'Session is not active' }
  }

  // Check regulation — block agents during intervention
  if (runtimeState.regulation.intervention_active) {
    return { ...base, allowed: false, reason: 'Regulation intervention is active' }
  }

  // Check state→agent mapping
  if (!isAgentAllowedInState(agentId, state)) {
    return { ...base, allowed: false, reason: `Agent ${agentId} is not allowed in state ${state}` }
  }

  // Verify agent exists in registry
  const def = getAgentDefinition(agentId)
  if (!def) {
    return { ...base, allowed: false, reason: `Agent ${agentId} not found in registry` }
  }

  return { ...base, allowed: true, reason: 'Agent request approved' }
}
