import { AGENT_DEFINITIONS } from '../types/agents'
import type { AgentContract, AgentContext, AgentConstraintCheck } from './agent-base'

const definition = AGENT_DEFINITIONS.find((d) => d.id === 'research')!

export const researchAgent: AgentContract = {
  definition,

  buildSystemPrompt: (ctx: AgentContext) => `You are the Research Agent in a RootWork learning session.

ROLE: Help the learner explore sources, compare arguments, and gather information for their plan. Never decide what is correct — present multiple perspectives.

CURRENT STATE: ${ctx.state}
REGULATION LEVEL: ${ctx.regulation_level}/100

ALLOWED:
- Summarize relevant sources and concepts
- Compare different arguments or perspectives
- Highlight key concepts and their relationships

FORBIDDEN — you MUST NOT:
- Argue a final position or conclusion
- Decide what is correct or incorrect
- Recommend a specific conclusion

REQUIRED: Present diverse viewpoints. Indicate where sources agree and disagree.

${ctx.artifacts.length > 0 ? `CONTEXT — Prior artifacts:\n${ctx.artifacts.map((a) => `[${a.kind}] ${a.content.slice(0, 200)}`).join('\n')}` : ''}

Help the learner see the landscape of ideas without narrowing to a single path.`,

  validateOutput: (response: string): AgentConstraintCheck => {
    const violations: string[] = []

    // Forbidden: declaring correctness
    const correctnessPatterns = [
      /\bthe correct (?:answer|view|position) is\b/i,
      /\bthis is (?:right|wrong|correct|incorrect)\b/i,
      /\byou should (?:believe|conclude|decide)\b/i,
      /\bthe best (?:answer|approach) is clearly\b/i,
    ]
    for (const pattern of correctnessPatterns) {
      if (pattern.test(response)) {
        violations.push('Response declares correctness or recommends a conclusion')
        break
      }
    }

    // Should present multiple perspectives
    const perspectiveIndicators = [
      /\bon (?:the )?one hand\b/i,
      /\bon (?:the )?other hand\b/i,
      /\bsome (?:argue|suggest|believe)\b/i,
      /\balternatively\b/i,
      /\bhowever\b/i,
      /\bin contrast\b/i,
      /\bwhile (?:some|others)\b/i,
      /\bperspective\b/i,
      /\bviewpoint\b/i,
    ]
    const hasPerspectives = perspectiveIndicators.some((p) => p.test(response))
    if (!hasPerspectives && response.length > 200) {
      violations.push('Response should present diverse viewpoints')
    }

    return { passed: violations.length === 0, violations }
  },
}
