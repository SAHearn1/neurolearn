/**
 * Adaptation Scripts — builds context-aware, personalised system prompts for each RACA agent.
 * AI-07: Personalized Agent Probing.
 */

import type { DiagnosticContext } from '../../../hooks/useSessionDiagnostic'

export interface AgentPersonalizationContext {
  diagnostic: DiagnosticContext | null
  currentState: string
  agentId: string
  traceScores?: Record<string, number>
  sessionTurn: number // which turn in the session (1-based)
}

const AGENT_BASE_PROMPTS: Record<string, string> = {
  framing:
    "You are a Socratic guide. Never give answers. Ask one question at a time that deepens the learner's own reasoning.",
  socratic:
    "You are a Socratic guide. Never give answers. Ask one question at a time that deepens the learner's own reasoning.",
  feedback:
    'You are a growth-focused feedback coach. Reference the learner\'s actual words. Always include a "What to try next" directive.',
  research:
    'You are a research guide. Help the learner find and evaluate sources. Do not provide facts directly.',
  synthesis:
    'You are a synthesis coach. Help the learner connect ideas across concepts and sessions.',
  reflection:
    'You are a reflection facilitator. Help the learner notice how they think, not just what they think.',
  construction:
    "You are a construction coach. Provide outlines and examples without replacing the learner's draft.",
  critique:
    'You are a critique coach. Identify logical gaps and counterpoints without declaring correctness.',
  defense:
    "You are a defense facilitator. Ask defense questions to strengthen the learner's understanding. Ask questions only — no declarative statements.",
}

/**
 * Returns a directive embedding active CCSS standards into agent prompts.
 * Agents use these codes to frame Socratic questions aligned with the lesson's standards.
 */
export function ccssDirective(ccssStandardCodes: string[]): string {
  if (ccssStandardCodes.length === 0) return ''
  const codeList = ccssStandardCodes.slice(0, 4).join(', ')
  return `This lesson targets the following standards: ${codeList}. Frame your questions and probing around the thinking skills these standards require.`
}

/**
 * Returns a directive personalising the agent opening for returning learners
 * based on the outcome of their prior session.
 */
export function priorOutcomeDirective(
  outcome: 'proficient' | 'in_progress' | 'developing' | 'not_started',
): string {
  switch (outcome) {
    case 'proficient':
      return 'The learner completed a prior session at proficiency. Build on their demonstrated mastery — push toward extension and synthesis rather than re-explanation.'
    case 'in_progress':
      return 'The learner has engaged with this material before but is still developing. Acknowledge their prior effort and invite them to revisit and deepen their thinking.'
    case 'developing':
      return 'The learner is earlier in their journey with this material. Use patient, scaffolded questioning and affirm their willingness to try.'
    case 'not_started':
      return ''
  }
}

/**
 * Returns a directive instructing the agent to focus on the weakest TRACE dimension.
 */
export function traceFocusDirective(traceScores: Record<string, number>): string {
  let weakestDim: string | null = null
  let weakestScore = Infinity

  for (const [dim, score] of Object.entries(traceScores)) {
    if (typeof score === 'number' && score < weakestScore) {
      weakestScore = score
      weakestDim = dim
    }
  }

  if (weakestDim === null) return ''

  if (weakestScore > 7) {
    return 'The learner is performing well across all TRACE dimensions. Push for deeper synthesis.'
  }

  return `The learner's weakest TRACE dimension is '${weakestDim}' (score ${weakestScore.toFixed(1)}/10). Prioritize questions that help them express their reasoning more clearly and precisely.`
}

/**
 * Returns a scaffolding directive based on difficulty level.
 */
export function difficultyDirective(difficulty: number): string {
  if (difficulty <= 0.33) {
    return 'Use simpler vocabulary. Break questions into smaller steps. Provide more scaffolding.'
  }
  if (difficulty <= 0.66) {
    return 'Use standard academic vocabulary. Ask one focused question at a time.'
  }
  return 'Challenge the learner with higher-order questions. Expect precise, well-argued responses.'
}

/**
 * Builds a fully personalised system prompt for an agent given the current session context.
 */
export function buildPersonalizedSystem(
  agentId: string,
  context: AgentPersonalizationContext,
): string {
  const base = AGENT_BASE_PROMPTS[agentId] ?? AGENT_BASE_PROMPTS['framing']

  const parts: string[] = [base]

  if (context.traceScores) {
    const directive = traceFocusDirective(context.traceScores)
    if (directive) parts.push(directive)
  }

  if (context.diagnostic?.currentDifficulty !== undefined) {
    parts.push(difficultyDirective(context.diagnostic.currentDifficulty))
  }

  if (context.sessionTurn === 1) {
    parts.push(
      'This is the first turn of the session. Start with a welcoming, open-ended question.',
    )
  } else if (context.sessionTurn > 5) {
    parts.push(
      `This is turn ${context.sessionTurn}. The learner has engaged extensively — invite synthesis and meta-reflection.`,
    )
  }

  return parts.join('\n\n')
}
