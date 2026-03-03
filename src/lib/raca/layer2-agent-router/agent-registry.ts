import { AGENT_DEFINITIONS } from '../types/agents'
import type { AgentId, AgentDefinition } from '../types/agents'

/**
 * Agent Registry — static registry of all RACA agents with validation.
 */

const agentMap = new Map<AgentId, AgentDefinition>(AGENT_DEFINITIONS.map((d) => [d.id, d]))

export function getAgentDefinition(id: AgentId): AgentDefinition | undefined {
  return agentMap.get(id)
}

export function getAllAgentDefinitions(): AgentDefinition[] {
  return AGENT_DEFINITIONS
}

export function validateAgentDefinitions(): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const seenIds = new Set<string>()

  for (const def of AGENT_DEFINITIONS) {
    if (!def.id) errors.push('Agent definition missing id')
    if (!def.label) errors.push(`Agent ${def.id}: missing label`)
    if (def.allowedStates.length === 0) errors.push(`Agent ${def.id}: no allowed states`)
    if (def.mustReturn.length === 0) errors.push(`Agent ${def.id}: no mustReturn constraints`)
    if (seenIds.has(def.id)) errors.push(`Duplicate agent id: ${def.id}`)
    seenIds.add(def.id)
  }

  return { valid: errors.length === 0, errors }
}
