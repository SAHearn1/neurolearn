import { AGENT_DEFINITIONS } from '../types/agents'
import type { AgentContract, AgentContext, AgentConstraintCheck } from './agent-base'
import { countQuestions } from './agent-base'

const definition = AGENT_DEFINITIONS.find((d) => d.id === 'defense')!

export const defenseAgent: AgentContract = {
  definition,

  buildSystemPrompt: (ctx: AgentContext) => {
    const revision = ctx.artifacts.find((a) => a.kind === 'revision') ??
      ctx.artifacts.find((a) => a.kind === 'draft')
    const defenseResponse = ctx.artifacts.find((a) => a.kind === 'defense_response')

    return `You are the Defense Agent in a RootWork learning session.

ROLE: Ask probing questions that help the learner demonstrate and strengthen their understanding. You ask questions ONLY — you never provide answers or rewrite the learner's work.

CURRENT STATE: ${ctx.state}
REGULATION LEVEL: ${ctx.regulation_level}/100

ALLOWED:
- Ask defense questions that probe understanding
- Request evidence or examples to support claims
- Ask the learner to explain their reasoning

FORBIDDEN — you MUST NOT:
- Rewrite the learner's explanation
- Provide answers to your own questions
- Declare mastery or make assessments

REQUIRED: Your response MUST consist of questions only — no declarative statements about the learner's work quality.

${revision ? `LEARNER'S REVISED WORK:\n${revision.content}` : ''}
${defenseResponse ? `LEARNER'S DEFENSE SO FAR:\n${defenseResponse.content}` : ''}

Ask questions that genuinely probe understanding. Make the learner think, not just recall.`
  },

  validateOutput: (response: string): AgentConstraintCheck => {
    const violations: string[] = []

    // Must contain questions
    const questionCount = countQuestions(response)
    if (questionCount < 1) {
      violations.push('Defense agent must ask at least 1 question')
    }

    // Check for declarative statements about work quality
    const declarativePatterns = [
      /\byou(?:'ve| have) (?:demonstrated|shown|proven|mastered)\b/i,
      /\byour (?:understanding|work) is (?:excellent|great|good|solid|strong)\b/i,
      /\bI(?:'m| am) (?:satisfied|convinced|impressed)\b/i,
    ]
    for (const pattern of declarativePatterns) {
      if (pattern.test(response)) {
        violations.push('Defense agent must not make declarative assessments')
        break
      }
    }

    // Check ratio: mostly questions, few statements
    const sentences = response.split(/[.!?]+/).filter((s) => s.trim().length > 5)
    const questionSentences = response.split('?').length - 1
    if (sentences.length > 0 && questionSentences < sentences.length * 0.4) {
      violations.push('Response should primarily consist of questions')
    }

    return { passed: violations.length === 0, violations }
  },
}
