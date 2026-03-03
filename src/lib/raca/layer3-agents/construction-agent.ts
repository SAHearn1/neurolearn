import { AGENT_DEFINITIONS } from '../types/agents'
import type { AgentContract, AgentContext, AgentConstraintCheck } from './agent-base'
import { countWords } from './agent-base'

const definition = AGENT_DEFINITIONS.find((d) => d.id === 'construction')!

export const constructionAgent: AgentContract = {
  definition,

  buildSystemPrompt: (ctx: AgentContext) => {
    const learnerDraft = ctx.artifacts.find((a) => a.kind === 'draft')
    const learnerWords = learnerDraft ? countWords(learnerDraft.content) : 0
    // AI word limit: use learner's word count as ceiling, with a minimum floor of 50
    // to allow meaningful structural guidance even for very short drafts.
    // The floor prevents the agent from being muted when the learner has written little.
    const maxAiWords = Math.max(learnerWords, 50)

    return `You are the Construction Agent in a RootWork learning session.

ROLE: Help the learner build their draft by providing outlines, examples, and structural suggestions. Never replace the learner's own work.

CURRENT STATE: ${ctx.state}
REGULATION LEVEL: ${ctx.regulation_level}/100

ALLOWED:
- Provide outlines and organizational frameworks
- Offer relevant examples (without completing the work)
- Suggest structural improvements

FORBIDDEN — you MUST NOT:
- Replace or rewrite the learner's draft
- Write a full response or complete their work
- Produce more than ${maxAiWords} words (learner wrote ${learnerWords} words — your output must not exceed their effort)

WORD LIMIT: Keep your response under ${maxAiWords} words.

${learnerDraft ? `LEARNER'S CURRENT DRAFT:\n${learnerDraft.content}` : 'The learner has not started drafting yet. Help them get started with structure, not content.'}

Support the learner's construction process without doing the building for them.`
  },

  validateOutput: (response: string, ctx: AgentContext): AgentConstraintCheck => {
    const violations: string[] = []

    // AI tokens must not exceed learner tokens
    const learnerDraft = ctx.artifacts.find((a) => a.kind === 'draft')
    if (learnerDraft) {
      const learnerWords = countWords(learnerDraft.content)
      const aiWords = countWords(response)
      if (aiWords > learnerWords && learnerWords > 0) {
        violations.push(
          `AI response (${aiWords} words) exceeds learner draft (${learnerWords} words)`,
        )
      }
    }

    // Check for full replacement patterns
    const replacementPatterns = [
      /\bhere(?:'s| is) (?:a |your )?(?:complete|full|finished) (?:draft|response|answer)\b/i,
      /\bI(?:'ve| have) (?:written|rewritten|completed) (?:it|this|your|the)\b/i,
    ]
    for (const pattern of replacementPatterns) {
      if (pattern.test(response)) {
        violations.push('Response appears to replace the learner draft')
        break
      }
    }

    return { passed: violations.length === 0, violations }
  },
}
