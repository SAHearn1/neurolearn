import type { AgentId, AgentDefinition } from '../types/agents'
import type { CognitiveState } from '../types/cognitive-states'
import type { EpistemicSnapshot } from '../types/epistemic'
import type { Artifact } from '../types/artifacts'

/**
 * Agent Base — shared interface and context for all RACA agents.
 */

export interface AgentContext {
  sessionId: string
  state: CognitiveState
  regulation_level: number
  artifacts: Artifact[]
  epistemic: EpistemicSnapshot | null
  learner_input: string
  session_history: string[]
  accessibility: {
    text_size: string
    reduce_motion: boolean
  }
}

export interface AgentInvokeRequest {
  agentId: AgentId
  context: AgentContext
}

export interface AgentConstraintCheck {
  passed: boolean
  violations: string[]
}

export interface AgentContract {
  definition: AgentDefinition
  buildSystemPrompt: (context: AgentContext) => string
  validateOutput: (response: string, context: AgentContext) => AgentConstraintCheck
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function countQuestions(text: string): number {
  return (text.match(/\?/g) || []).length
}
