/**
 * RACA Feature Flags — progressive rollout for each layer.
 *
 * All flags read from VITE_RACA_ENABLE_* environment variables.
 * When a flag is off, the corresponding layer is inert —
 * the app behaves as if RACA doesn't exist.
 *
 * Development defaults: stable layers default to `true` when the env var is
 * absent so the engine works out-of-the-box for local development without
 * needing to copy .env.example.  Flags that require external services (AI
 * provider keys, Supabase write access) default to `false` and must be
 * explicitly opted in.
 *
 * Production: every flag must be set explicitly in the deployment environment
 * (e.g. Vercel dashboard → Settings → Environment Variables).
 */

/**
 * Read a feature flag from the environment.
 *
 * @param key        - The VITE_* env variable name.
 * @param devDefault - Value used in development when the env var is absent.
 *                     Defaults to `true` (stable flags).  Set to `false` for
 *                     flags that require external services.
 */
const readFlag = (key: string, devDefault = true): boolean => {
  // In development, allow localStorage overrides for easy per-session testing.
  if (import.meta.env.DEV) {
    const override = localStorage.getItem(`raca.override.${key}`)
    if (override !== null) return override === 'true'

    // When the var is absent or empty, fall back to the dev-time default so
    // developers don't need to configure every flag to get a working engine.
    if (import.meta.env[key] === undefined || import.meta.env[key] === '') return devDefault
  }
  return import.meta.env[key] === 'true'
}

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

  /**
   * Layer 3: AI agent invocations.
   * Requires an AI provider key and Supabase Edge Function deployment.
   * Off by default — opt in explicitly via VITE_RACA_ENABLE_AGENTS=true.
   */
  get agents() {
    return readFlag('VITE_RACA_ENABLE_AGENTS', false)
  },

  /** Layer 4: Epistemic monitoring + TRACE */
  get epistemicMonitoring() {
    return readFlag('VITE_RACA_ENABLE_EPISTEMIC')
  },

  /** Guardrails: Cross-cutting constraint enforcement */
  get guardrails() {
    return readFlag('VITE_RACA_ENABLE_GUARDRAILS')
  },

  /**
   * Audit: Persist events to Supabase.
   * Requires Supabase project write access.
   * Off by default — opt in explicitly via VITE_RACA_ENABLE_AUDIT=true.
   */
  get auditPersistence() {
    return readFlag('VITE_RACA_ENABLE_AUDIT', false)
  },

  /** Adaptation: Dynamic difficulty / scaffolding adjustment */
  get adaptation() {
    return readFlag('VITE_RACA_ENABLE_ADAPTATION')
  },
} as const

export type RacaFlagKey = keyof typeof racaFlags
