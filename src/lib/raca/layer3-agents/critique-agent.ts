import { AGENT_DEFINITIONS } from '../types/agents'
import type { AgentContract, AgentContext, AgentConstraintCheck } from './agent-base'
import { traceFocusDirective, ccssDirective, priorOutcomeDirective } from './adaptation-scripts'

const definition = AGENT_DEFINITIONS.find((d) => d.id === 'critique')!

export const critiqueAgent: AgentContract = {
  definition,

  buildSystemPrompt: (ctx: AgentContext) => {
    const revision =
      ctx.artifacts.find((a) => a.kind === 'revision') ??
      ctx.artifacts.find((a) => a.kind === 'draft')

    const traceSection = ctx.traceProfile ? traceFocusDirective(ctx.traceProfile) : ''
    const ccssSection = ctx.ccssStandardCodes ? ccssDirective(ctx.ccssStandardCodes) : ''
    const priorSection = ctx.priorSessionOutcome
      ? priorOutcomeDirective(ctx.priorSessionOutcome)
      : ''
    const adaptiveSections = [traceSection, ccssSection, priorSection].filter(Boolean).join('\n\n')

    return `You are the Critique Agent in a RootWork learning session.

ROLE: Help the learner strengthen their work by identifying logical gaps, offering counterpoints, and suggesting areas for improvement. Never declare work correct or assign grades.

CURRENT STATE: ${ctx.state}
REGULATION LEVEL: ${ctx.regulation_level}/100

ALLOWED:
- Identify logical gaps or weak reasoning
- Offer counterpoints and counter-examples
- Suggest specific areas for strengthening

FORBIDDEN — you MUST NOT:
- Declare the work correct or incorrect
- Assign grades or scores
- Rewrite the learner's work

REQUIRED: Your response MUST include at least 1 counterargument or critical question.

${revision ? `LEARNER'S WORK:\n${revision.content}\n` : 'No learner work available yet.\n'}${adaptiveSections ? `\nADAPTIVE CONTEXT:\n${adaptiveSections}\n` : ''}
Be constructive and specific. Point to exact parts of the reasoning that could be stronger.`
  },

  validateOutput: (response: string): AgentConstraintCheck => {
    const violations: string[] = []

    // Must include counterargument indicators
    const counterIndicators = [
      /\bhowever\b/i,
      /\bon the other hand\b/i,
      /\bcounterpoint\b/i,
      /\bcounter-?argument\b/i,
      /\bwhat if\b/i,
      /\bconsider (?:that|whether|the)\b/i,
      /\balternatively\b/i,
      /\bchallenge\b/i,
      /\bweakness\b/i,
      /\bgap\b/i,
      /\bmissing\b/i,
      /\?/, // Questions serve as critique
    ]
    const hasCritique = counterIndicators.some((p) => p.test(response))
    if (!hasCritique) {
      violations.push('Response must include at least 1 counterargument or critical question')
    }

    // Forbidden: grading
    const gradingPatterns = [
      /\b(?:grade|score|rating|mark):\s*[A-F\d]/i,
      /\b\d+\s*(?:out of|\/)\s*\d+/i,
      /\bthis is (?:correct|right|perfect|excellent work)\b/i,
    ]
    for (const pattern of gradingPatterns) {
      if (pattern.test(response)) {
        violations.push('Response contains grading or correctness declaration')
        break
      }
    }

    return { passed: violations.length === 0, violations }
  },
}
