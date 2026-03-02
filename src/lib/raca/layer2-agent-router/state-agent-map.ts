import { STATE_AGENT_MAP, AGENT_DEFINITIONS } from '../types/agents'
import type { CognitiveState } from '../types/cognitive-states'
import type { AgentId, AgentDefinition } from '../types/agents'

/**
 * State→Agent Map — resolves which agents are available for a given state.
 */

export function getAgentsForState(state: CognitiveState): AgentId[] {
  return STATE_AGENT_MAP[state]
}

export function getAgentDefinitionsForState(state: CognitiveState): AgentDefinition[] {
  const ids = STATE_AGENT_MAP[state]
  return ids.map((id) => AGENT_DEFINITIONS.find((d) => d.id === id)!)
}

export function isAgentAllowedInState(agentId: AgentId, state: CognitiveState): boolean {
  return STATE_AGENT_MAP[state].includes(agentId)
}

export function hasAgentsAvailable(state: CognitiveState): boolean {
  return STATE_AGENT_MAP[state].length > 0
}
