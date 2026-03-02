/**
 * RACA Feature Flags — progressive rollout for each layer.
 *
 * All flags read from VITE_RACA_ENABLE_* environment variables.
 * When a flag is off, the corresponding layer is inert —
 * the app behaves as if RACA doesn't exist.
 */

const readFlag = (key: string): boolean =>
  import.meta.env[key] === 'true'

export const racaFlags = {
  /** Layer 0: Session runtime, events, audit trail */
  get runtime() {
    return readFlag('VITE_RACA_ENABLE_RUNTIME')
  },

  /** Layer 1: Cognitive state machine (9 states) */
  get cognitiveFsm() {
    return readFlag('VITE_RACA_ENABLE_COGNITIVE_FSM')
  },

  /** Layer 2: Agent router (state→agent mapping) */
  get agentRouter() {
    return readFlag('VITE_RACA_ENABLE_AGENT_ROUTER')
  },

  /** Layer 3: AI agent invocations */
  get agents() {
    return readFlag('VITE_RACA_ENABLE_AGENTS')
  },

  /** Layer 4: Epistemic monitoring + TRACE */
  get epistemicMonitoring() {
    return readFlag('VITE_RACA_ENABLE_EPISTEMIC')
  },

  /** Guardrails: Cross-cutting constraint enforcement */
  get guardrails() {
    return readFlag('VITE_RACA_ENABLE_GUARDRAILS')
  },

  /** Audit: Persist events to Supabase */
  get auditPersistence() {
    return readFlag('VITE_RACA_ENABLE_AUDIT')
  },

  /** Adaptation: Dynamic difficulty / scaffolding adjustment */
  get adaptation() {
    return readFlag('VITE_RACA_ENABLE_ADAPTATION')
  },
} as const

export type RacaFlagKey = keyof typeof racaFlags
