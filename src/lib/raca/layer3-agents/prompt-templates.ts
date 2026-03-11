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

export function buildPromptBundle(agentId: AgentId, context: AgentContext): PromptBundle {
  const system = getAgentSystemPrompt(agentId, context)

  const sessionContext =
    context.session_history.length > 0
      ? `\n\nRecent session activity:\n${context.session_history.slice(-5).join('\n')}`
      : ''

  const accessibilityNote = context.accessibility.reduce_motion
    ? '\n\nNote: Keep responses calm and measured. Avoid excessive formatting.'
    : ''

  // Surface the learner's weakest TRACE dimension as a brief inline note so the
  // model also sees it in the user turn (not only in the system prompt).
  let traceHint = ''
  if (context.traceProfile) {
    let weakDim: string | null = null
    let weakScore = Infinity
    for (const [dim, score] of Object.entries(context.traceProfile)) {
      if (typeof score === 'number' && score < weakScore) {
        weakScore = score
        weakDim = dim
      }
    }
    if (weakDim !== null && weakScore < 7) {
      traceHint = `\n\n[TRACE note: learner's weakest dimension is '${weakDim}' (${weakScore.toFixed(1)}/10) — prioritize eliciting explicit ${weakDim} in this turn]`
    }
  }

  const user = `${context.learner_input}${sessionContext}${accessibilityNote}${traceHint}`

  return {
    system,
    user,
    maxTokens: TOKEN_LIMITS[agentId],
  }
}
