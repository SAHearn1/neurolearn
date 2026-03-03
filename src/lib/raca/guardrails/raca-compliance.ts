import type { AgentId } from '../types/agents'
import type { AgentContext } from '../layer3-agents/agent-base'
import { validateAgentOutput } from '../layer3-agents/output-validator'

/**
 * RACA Compliance — cross-cutting content safety and pedagogical guardrails.
 * Applied to all agent outputs regardless of agent type.
 */

export interface ComplianceResult {
  passed: boolean
  violations: string[]
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical'
}

/** Patterns that are NEVER acceptable in any agent response */
const FORBIDDEN_PATTERNS = {
  diagnostic_labels: [
    /\byou (?:have|show signs of|exhibit|display) (?:ADHD|autism|dyslexia|anxiety|depression)\b/i,
    /\byou(?:'re| are) (?:probably|likely) (?:ADHD|autistic|dyslexic)\b/i,
    /\bI think you (?:might |may )?have\b/i,
  ],
  shaming_language: [
    /\bthat(?:'s| is) (?:stupid|dumb|lazy|pathetic|embarrassing|shameful)\b/i,
    /\byou should be (?:ashamed|embarrassed)\b/i,
    /\byou(?:'re| are) not (?:trying|smart enough)\b/i,
  ],
  medical_advice: [
    /\byou should (?:take|stop taking) (?:medication|medicine)\b/i,
    /\btalk to (?:a |your )?(?:doctor|psychiatrist|psychologist) about\b/i,
  ],
  grade_assignment: [
    /\byour (?:grade|score|mark) (?:is|would be)\b/i,
    /\b(?:A|B|C|D|F)[+-]?\s*(?:grade|rating)\b/i,
  ],
}

export function checkComplianceGlobal(response: string): ComplianceResult {
  const violations: string[] = []

  for (const [category, patterns] of Object.entries(FORBIDDEN_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(response)) {
        violations.push(`${category}: matched forbidden pattern`)
        break
      }
    }
  }

  const severity =
    violations.length === 0
      ? 'none'
      : violations.some((v) => v.startsWith('diagnostic') || v.startsWith('shaming'))
        ? 'critical'
        : violations.some((v) => v.startsWith('medical'))
          ? 'high'
          : 'medium'

  return { passed: violations.length === 0, violations, severity }
}

export function checkFullCompliance(
  agentId: AgentId,
  response: string,
  context: AgentContext,
): ComplianceResult {
  // Layer 1: Global safety
  const globalResult = checkComplianceGlobal(response)

  // Layer 2: Agent-specific constraints
  const agentResult = validateAgentOutput(agentId, response, context)

  const allViolations = [...globalResult.violations, ...agentResult.violations]

  return {
    passed: allViolations.length === 0,
    violations: allViolations,
    severity:
      globalResult.severity !== 'none'
        ? globalResult.severity
        : allViolations.length > 0
          ? 'medium'
          : 'none',
  }
}
