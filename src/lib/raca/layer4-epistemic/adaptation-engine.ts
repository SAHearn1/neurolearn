import type { EpistemicSnapshot, RegulationState, TraceFluency } from '../types/epistemic'

/**
 * Adaptation Engine — adjusts support level based on epistemic state.
 *
 * Adaptation levels:
 * - standard:   Normal prompting, full cognitive load
 * - guided:     More structured prompts, chunked tasks
 * - supported:  Shorter prompts, increased scaffolding, more questions
 * - scaffolded: Maximum support — minimal text, visual aids, step-by-step
 *
 * NEVER produces diagnostic labels. Only adjusts interaction style.
 */

export type AdaptationLevel = 'standard' | 'guided' | 'supported' | 'scaffolded'

export interface AdaptationConfig {
  level: AdaptationLevel
  maxPromptLength: number
  chunkSize: number
  questionFrequency: 'normal' | 'increased' | 'every_turn'
  structureLevel: 'open' | 'outlined' | 'step_by_step'
  encouragementLevel: 'minimal' | 'moderate' | 'frequent'
}

const ADAPTATION_CONFIGS: Record<AdaptationLevel, AdaptationConfig> = {
  standard: {
    level: 'standard',
    maxPromptLength: 1000,
    chunkSize: 500,
    questionFrequency: 'normal',
    structureLevel: 'open',
    encouragementLevel: 'minimal',
  },
  guided: {
    level: 'guided',
    maxPromptLength: 700,
    chunkSize: 350,
    questionFrequency: 'increased',
    structureLevel: 'outlined',
    encouragementLevel: 'moderate',
  },
  supported: {
    level: 'supported',
    maxPromptLength: 400,
    chunkSize: 200,
    questionFrequency: 'every_turn',
    structureLevel: 'step_by_step',
    encouragementLevel: 'frequent',
  },
  scaffolded: {
    level: 'scaffolded',
    maxPromptLength: 250,
    chunkSize: 100,
    questionFrequency: 'every_turn',
    structureLevel: 'step_by_step',
    encouragementLevel: 'frequent',
  },
}

export function determineAdaptationLevel(
  regulation: RegulationState,
  trace: TraceFluency,
): AdaptationLevel {
  // Regulation overrides everything
  if (regulation.level < 30) return 'scaffolded'
  if (regulation.level < 50) return 'supported'

  // TRACE fluency determines among remaining levels
  if (trace.overall < 3) return 'supported'
  if (trace.overall < 5) return 'guided'

  // High regulation + good fluency = standard
  return 'standard'
}

export function getAdaptationConfig(level: AdaptationLevel): AdaptationConfig {
  return ADAPTATION_CONFIGS[level]
}

export function buildAdaptationSnapshot(
  sessionId: string,
  trace: TraceFluency,
  regulation: RegulationState,
): EpistemicSnapshot {
  return {
    session_id: sessionId,
    trace,
    regulation,
    adaptation_level: determineAdaptationLevel(regulation, trace),
    timestamp: new Date().toISOString(),
  }
}
