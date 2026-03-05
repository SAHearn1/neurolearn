/**
 * RACA Epistemic Types — cognitive monitoring and adaptation.
 *
 * TRACE fluency indicators (6 dimensions):
 * T = Think    (pause before responding)
 * R = Reason   (explicit reasoning moves)
 * A = Articulate (clear expression)
 * C = Check    (self-correction)
 * E = Extend   (connection to broader ideas)
 * E2= Ethical  (ethical reasoning markers — spec §VIII)
 */

export interface TraceFluency {
  think: number // 0-10: pause quality before responding
  reason: number // 0-10: explicit reasoning moves
  articulate: number // 0-10: clarity of expression
  check: number // 0-10: self-correction frequency
  extend: number // 0-10: connection to broader ideas
  ethical: number // 0-10: ethical reasoning markers (fairness, harm, equity, dignity)
  overall: number // 0-10: weighted composite
}

export interface DysregulationSignal {
  type:
    | 'negative_self_talk'
    | 'avoidance'
    | 'all_caps'
    | 'excessive_punctuation'
    | 'rapid_short_responses'
    | 'rapid_timing'
    | 'abandoned_draft'
    | 'repeated_incomplete'
  severity: 1 | 2 | 3
  detail: string
}

export interface RegulationState {
  level: number // 0-100
  signals: DysregulationSignal[]
  intervention_active: boolean
  intervention_count: number
  last_check: string
}

export interface CognitiveProfile {
  user_id: string
  session_count: number
  revision_frequency: number
  reflection_depth_avg: number
  defense_strength_avg: number
  framing_sophistication: number
  trace_averages: TraceFluency
  growth_trajectory: 'emerging' | 'developing' | 'proficient'
  updated_at: string
}

export interface EpistemicSnapshot {
  session_id: string
  trace: TraceFluency
  regulation: RegulationState
  adaptation_level: 'standard' | 'guided' | 'supported' | 'scaffolded'
  timestamp: string
}
