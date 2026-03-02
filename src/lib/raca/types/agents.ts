import type { CognitiveState } from './cognitive-states'

/**
 * RACA Agent Types — defines the 5 state-gated AI agents
 * and their constraint contracts.
 */

export const AGENT_IDS = [
  'framing',
  'research',
  'construction',
  'critique',
  'defense',
] as const

export type AgentId = (typeof AGENT_IDS)[number]

export interface AgentDefinition {
  id: AgentId
  label: string
  description: string
  allowedStates: CognitiveState[]
  allowed: string[]
  forbidden: string[]
  mustReturn: string[]
}

export const AGENT_DEFINITIONS: AgentDefinition[] = [
  {
    id: 'framing',
    label: 'Framing Agent',
    description: 'Helps learner clarify questions and explore alternative framings.',
    allowedStates: ['POSITION', 'PLAN', 'RECONNECT'],
    allowed: ['Clarifying questions', 'Alternative framings', 'Perspective prompts'],
    forbidden: ['Solutions', 'Full responses', 'Direct answers'],
    mustReturn: ['At least 1 reflective question'],
  },
  {
    id: 'research',
    label: 'Research Agent',
    description: 'Summarizes sources and compares arguments without deciding correctness.',
    allowedStates: ['PLAN'],
    allowed: ['Summarize sources', 'Compare arguments', 'Highlight key concepts'],
    forbidden: ['Argue final position', 'Decide correctness', 'Recommend conclusion'],
    mustReturn: ['Source diversity indicator'],
  },
  {
    id: 'construction',
    label: 'Construction Agent',
    description: 'Provides outlines and examples without replacing learner draft.',
    allowedStates: ['APPLY'],
    allowed: ['Outlines', 'Examples', 'Structural suggestions'],
    forbidden: ['Replace learner draft', 'Write full response', 'Complete the work'],
    mustReturn: ['AI tokens <= learner tokens'],
  },
  {
    id: 'critique',
    label: 'Critique Agent',
    description: 'Identifies logical gaps and counterpoints without declaring correctness.',
    allowedStates: ['REVISE'],
    allowed: ['Logical gaps', 'Counterpoints', 'Strengthening suggestions'],
    forbidden: ['Declare correctness', 'Assign grades', 'Rewrite learner work'],
    mustReturn: ['At least 1 counterargument'],
  },
  {
    id: 'defense',
    label: 'Defense Agent',
    description: 'Asks defense questions to strengthen learner understanding.',
    allowedStates: ['DEFEND'],
    allowed: ['Defense questions', 'Evidence strengthening prompts'],
    forbidden: ['Rewrite learner explanation', 'Provide answers', 'Declare mastery'],
    mustReturn: ['Questions only — no declarative statements'],
  },
]

/** Maps each cognitive state to the agents allowed in that state */
export const STATE_AGENT_MAP: Record<CognitiveState, AgentId[]> = {
  ROOT: [],
  REGULATE: [],
  POSITION: ['framing'],
  PLAN: ['framing', 'research'],
  APPLY: ['construction'],
  REVISE: ['critique'],
  DEFEND: ['defense'],
  RECONNECT: ['framing'],
  ARCHIVE: [],
}

export interface AgentInvocation {
  id: string
  session_id: string
  agent_id: AgentId
  state: CognitiveState
  prompt: string
  response: string | null
  blocked: boolean
  block_reason: string | null
  constraint_violations: string[]
  created_at: string
}

export interface AgentResponse {
  content: string
  reflective_questions: string[]
  constraint_check: {
    passed: boolean
    violations: string[]
  }
}
