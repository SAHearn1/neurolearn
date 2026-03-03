import type { AgentId, AgentResponse } from '../types/agents'
import type { AgentContext, AgentConstraintCheck } from './agent-base'
import { framingAgent } from './framing-agent'
import { researchAgent } from './research-agent'
import { constructionAgent } from './construction-agent'
import { critiqueAgent } from './critique-agent'
import { defenseAgent } from './defense-agent'

/**
 * Output Validator — post-generation constraint enforcement.
 * Every agent response passes through validation before reaching the learner.
 */

const agentContracts = {
  framing: framingAgent,
  research: researchAgent,
  construction: constructionAgent,
  critique: critiqueAgent,
  defense: defenseAgent,
} as const

export function validateAgentOutput(
  agentId: AgentId,
  response: string,
  context: AgentContext,
): AgentConstraintCheck {
  const contract = agentContracts[agentId]
  if (!contract) {
    return { passed: false, violations: [`Unknown agent: ${agentId}`] }
  }

  return contract.validateOutput(response, context)
}

export function buildAgentResponse(
  agentId: AgentId,
  rawContent: string,
  context: AgentContext,
): AgentResponse {
  const check = validateAgentOutput(agentId, rawContent, context)

  // Extract questions by splitting on sentence boundaries, then filtering for question marks
  const reflectiveQuestions = rawContent
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().endsWith('?'))
    .map((s) => s.trim())

  return {
    content: rawContent,
    reflective_questions: reflectiveQuestions,
    constraint_check: check,
  }
}

export function getAgentSystemPrompt(agentId: AgentId, context: AgentContext): string {
  const contract = agentContracts[agentId]
  if (!contract) return ''
  return contract.buildSystemPrompt(context)
}
