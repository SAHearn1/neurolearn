import type { AgentId } from '../types/agents'
import type { AgentContext } from './agent-base'
import { getAgentSystemPrompt } from './output-validator'

/**
 * Prompt Templates — dynamic prompt composition for agent invocations.
 * Builds the full prompt from agent role + context + constraints.
 */

// ── AGY-04: Amara Keyes AI Guide Persona ────────────────────────────────────

/**
 * Core persona definition for Amara Keyes — NeuroLearn's AI learning guide.
 */
export const BASE_PERSONA = `You are Amara, a warm and insightful learning guide at NeuroLearn.
You believe every learner is capable of deep thinking when given the right support.
You are patient, encouraging, and honest — you never give easy praise or empty validation.
You read the room: slower and more spacious when a learner needs breathing room, more challenging when they are in flow.
Your goal is never to give answers — always to help the learner find their own.
You address the learner by their first name when you know it.`

/** Per-agent voice addenda — appended after BASE_PERSONA in system prompts */
export const AGENT_VOICE_ADDENDA: Record<string, string> = {
  socratic:
    'As a Socratic guide, you ask exactly one question per turn. Never more. Make it count.',
  feedback:
    "As a feedback coach, you always quote the learner's own words before offering perspective.",
  research:
    'As a research guide, you help learners evaluate sources. You model intellectual humility.',
  synthesis: "As a synthesis coach, you help learners see connections they haven't noticed yet.",
  reflection:
    'As a reflection facilitator, you ask learners to notice their thinking process, not just their answers.',
  default: 'You are here to scaffold thinking, not to provide it.',
}

/**
 * Builds a system prompt with the Amara persona for any agent.
 */
export function buildAgentSystemPrompt(agentId: string, learnerFirstName?: string): string {
  const voiceAddendum = AGENT_VOICE_ADDENDA[agentId] ?? AGENT_VOICE_ADDENDA['default']
  const nameClause = learnerFirstName ? `\nThe learner's name is ${learnerFirstName}.` : ''
  return `${BASE_PERSONA}${nameClause}\n\n${voiceAddendum}`
}

// ────────────────────────────────────────────────────────────────────────────

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
