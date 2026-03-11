import { AGENT_DEFINITIONS } from '../types/agents'
import type { AgentContract, AgentContext, AgentConstraintCheck } from './agent-base'
import { countQuestions } from './agent-base'
import { traceFocusDirective, ccssDirective, priorOutcomeDirective } from './adaptation-scripts'

const definition = AGENT_DEFINITIONS.find((d) => d.id === 'framing')!

export const framingAgent: AgentContract = {
  definition,

  buildSystemPrompt: (ctx: AgentContext) => {
    const traceSection = ctx.traceProfile ? traceFocusDirective(ctx.traceProfile) : ''
    const ccssSection = ctx.ccssStandardCodes ? ccssDirective(ctx.ccssStandardCodes) : ''
    const priorSection = ctx.priorSessionOutcome
      ? priorOutcomeDirective(ctx.priorSessionOutcome)
      : ''
    const adaptiveSections = [traceSection, ccssSection, priorSection].filter(Boolean).join('\n\n')

    return `You are the Framing Agent in a RootWork learning session.

ROLE: Help the learner clarify their question, explore alternative framings, and deepen their initial understanding through reflective questions.

CURRENT STATE: ${ctx.state}
REGULATION LEVEL: ${ctx.regulation_level}/100

ALLOWED:
- Ask clarifying questions about the learner's understanding
- Suggest alternative ways to frame the problem
- Prompt reflection on assumptions and prior knowledge

FORBIDDEN — you MUST NOT:
- Provide solutions or direct answers
- Write full responses for the learner
- Skip the questioning process

REQUIRED: Your response MUST include at least 1 reflective question (ending with ?).

${ctx.artifacts.length > 0 ? `CONTEXT — Prior artifacts:\n${ctx.artifacts.map((a) => `[${a.kind}] ${a.content.slice(0, 200)}`).join('\n')}\n` : ''}${adaptiveSections ? `ADAPTIVE CONTEXT:\n${adaptiveSections}\n` : ''}
Respond to the learner's input with warmth and curiosity. Guide them toward deeper thinking without doing the thinking for them.`
  },

  validateOutput: (response: string): AgentConstraintCheck => {
    const violations: string[] = []

    // Must include at least 1 question
    if (countQuestions(response) < 1) {
      violations.push('Response must include at least 1 reflective question')
    }

    // Check for forbidden patterns — direct answers
    const directAnswerPatterns = [
      /\bthe answer is\b/i,
      /\bthe solution is\b/i,
      /\bhere(?:'s| is) (?:the|your) (?:answer|solution)\b/i,
      /\byou should (?:write|say|answer)\b/i,
    ]
    for (const pattern of directAnswerPatterns) {
      if (pattern.test(response)) {
        violations.push('Response contains a direct answer pattern')
        break
      }
    }

    return { passed: violations.length === 0, violations }
  },
}
