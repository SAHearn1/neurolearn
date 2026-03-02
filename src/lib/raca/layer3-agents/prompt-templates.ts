import type { AgentId } from '../types/agents'
import type { AgentContext } from './agent-base'
import { getAgentSystemPrompt } from './output-validator'

/**
 * Prompt Templates — dynamic prompt composition for agent invocations.
 * Builds the full prompt from agent role + context + constraints.
 */

export interface PromptBundle {
  system: string
  user: string
  maxTokens: number
}

const TOKEN_LIMITS: Record<AgentId, number> = {
  framing: 500,
  research: 800,
  construction: 600,
  critique: 600,
  defense: 400,
}

export function buildPromptBundle(
  agentId: AgentId,
  context: AgentContext,
): PromptBundle {
  const system = getAgentSystemPrompt(agentId, context)

  const sessionContext = context.session_history.length > 0
    ? `\n\nRecent session activity:\n${context.session_history.slice(-5).join('\n')}`
    : ''

  const accessibilityNote = context.accessibility.reduce_motion
    ? '\n\nNote: Keep responses calm and measured. Avoid excessive formatting.'
    : ''

  const user = `${context.learner_input}${sessionContext}${accessibilityNote}`

  return {
    system,
    user,
    maxTokens: TOKEN_LIMITS[agentId],
  }
}
