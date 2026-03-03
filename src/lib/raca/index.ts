/**
 * RACA — RootWork Agentic Cognitive Architecture
 *
 * Public API barrel export for the RACA system.
 * Import from this file for clean access to all RACA modules.
 */

// Types
export * from './types'

// Feature flags
export { racaFlags, type RacaFlagKey } from './feature-flags'

// Layer 0 — Runtime Authority
export { useRuntimeStore } from './layer0-runtime/runtime-store'
export { runtimeReducer, INITIAL_RUNTIME_STATE } from './layer0-runtime/runtime-reducer'
export type { RuntimeState, RuntimeAction } from './layer0-runtime/runtime-reducer'
export { startSession, endSession, recordEvent } from './layer0-runtime/session-manager'
export { appendAuditEvent, flushAuditBuffer, stopAuditFlush } from './layer0-runtime/audit-trail'
export {
  saveSessionLocal,
  restoreSessionLocal,
  clearSessionLocal,
  saveSessionRemote,
  restoreSessionRemote,
} from './layer0-runtime/persistence'

// Layer 1 — Cognitive State Machine
export {
  requestTransition,
  getCurrentState,
  getStateHistory,
} from './layer1-cognitive-fsm/state-machine'
export type { TransitionResult } from './layer1-cognitive-fsm/state-machine'
export { checkPrecondition } from './layer1-cognitive-fsm/preconditions'
export type { PreconditionResult } from './layer1-cognitive-fsm/preconditions'
export { isValidTransition, evaluateTransition } from './layer1-cognitive-fsm/transition-guards'
export { buildCognitiveSnapshot } from './layer1-cognitive-fsm/snapshot'
export type { CognitiveSnapshot } from './layer1-cognitive-fsm/snapshot'

// Layer 2 — Agent Router
export {
  getAgentsForState,
  getAgentDefinitionsForState,
  isAgentAllowedInState,
  hasAgentsAvailable,
} from './layer2-agent-router/state-agent-map'
export {
  getAgentDefinition,
  getAllAgentDefinitions,
  validateAgentDefinitions,
} from './layer2-agent-router/agent-registry'
export { routeAgentRequest } from './layer2-agent-router/router'
export type { RouteResult } from './layer2-agent-router/router'

// Layer 3 — Agents
export {
  validateAgentOutput,
  buildAgentResponse,
  getAgentSystemPrompt,
} from './layer3-agents/output-validator'
export { buildPromptBundle } from './layer3-agents/prompt-templates'
export type { PromptBundle } from './layer3-agents/prompt-templates'
export type { AgentContext, AgentContract, AgentConstraintCheck } from './layer3-agents/agent-base'
export { framingAgent } from './layer3-agents/framing-agent'
export { researchAgent } from './layer3-agents/research-agent'
export { constructionAgent } from './layer3-agents/construction-agent'
export { critiqueAgent } from './layer3-agents/critique-agent'
export { defenseAgent } from './layer3-agents/defense-agent'

// Layer 4 — Epistemic Monitoring
export {
  detectDysregulationSignals,
  computeRegulationDelta,
  shouldTriggerIntervention,
} from './layer4-epistemic/availability-detector'
export { scoreTRACE } from './layer4-epistemic/fluency-tracker'
export { buildCognitiveProfile } from './layer4-epistemic/cognitive-profile'
export {
  determineAdaptationLevel,
  getAdaptationConfig,
  buildAdaptationSnapshot,
} from './layer4-epistemic/adaptation-engine'
export type { AdaptationLevel, AdaptationConfig } from './layer4-epistemic/adaptation-engine'

// Guardrails
export { checkComplianceGlobal, checkFullCompliance } from './guardrails/raca-compliance'
export type { ComplianceResult } from './guardrails/raca-compliance'
export { enforcePreconditions, getBlockedStatesWithHints } from './guardrails/precondition-enforcer'
export {
  enforceQuestionsFirst,
  enforceReasoningBeforeConfirmation,
} from './guardrails/question-enforcer'
