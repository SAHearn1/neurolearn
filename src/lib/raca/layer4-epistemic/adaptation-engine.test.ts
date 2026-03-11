import { describe, it, expect } from 'vitest'
import {
  determineAdaptationLevel,
  getAdaptationConfig,
  buildAdaptationSnapshot,
} from './adaptation-engine'
import {
  detectDysregulationSignals,
  computeRegulationDelta,
  shouldTriggerIntervention,
} from './availability-detector'
import { INITIAL_RUNTIME_STATE } from '../layer0-runtime/runtime-reducer'
import type { TraceFluency } from '../types/epistemic'

/**
 * Adaptation Engine & Regulation — unit tests confirming that the adaptive
 * loop selects the correct support level and that regulation state updates
 * in response to dysregulation signals.
 */

const HIGH_TRACE: TraceFluency = {
  think: 8,
  reason: 8,
  articulate: 8,
  check: 8,
  extend: 8,
  ethical: 8,
  overall: 8,
}

const LOW_TRACE: TraceFluency = {
  think: 2,
  reason: 2,
  articulate: 2,
  check: 2,
  extend: 2,
  ethical: 2,
  overall: 2,
}

const baseRegulation = INITIAL_RUNTIME_STATE.regulation // level: 75

describe('Adaptation Engine — adaptive loop', () => {
  describe('determineAdaptationLevel', () => {
    it('returns "standard" when regulation is high and trace is good', () => {
      expect(determineAdaptationLevel(baseRegulation, HIGH_TRACE)).toBe('standard')
    })

    it('returns "guided" when regulation is high but trace overall is low (2-4)', () => {
      const medTrace: TraceFluency = { ...HIGH_TRACE, overall: 4 }
      expect(determineAdaptationLevel(baseRegulation, medTrace)).toBe('guided')
    })

    it('returns "supported" when regulation is low (30–49)', () => {
      const lowReg = { ...baseRegulation, level: 40 }
      expect(determineAdaptationLevel(lowReg, HIGH_TRACE)).toBe('supported')
    })

    it('returns "supported" when regulation is ok but trace overall is very low (<3)', () => {
      expect(determineAdaptationLevel(baseRegulation, LOW_TRACE)).toBe('supported')
    })

    it('returns "scaffolded" when regulation is critically low (<30)', () => {
      const criticalReg = { ...baseRegulation, level: 20 }
      expect(determineAdaptationLevel(criticalReg, HIGH_TRACE)).toBe('scaffolded')
    })
  })

  describe('getAdaptationConfig', () => {
    it('returns a config whose level matches the requested level', () => {
      const levels = ['standard', 'guided', 'supported', 'scaffolded'] as const
      for (const level of levels) {
        expect(getAdaptationConfig(level).level).toBe(level)
      }
    })

    it('scaffolded has the shortest max prompt length', () => {
      expect(getAdaptationConfig('scaffolded').maxPromptLength).toBeLessThan(
        getAdaptationConfig('standard').maxPromptLength,
      )
    })
  })

  describe('buildAdaptationSnapshot', () => {
    it('captures session ID, trace, regulation, and adaptation level', () => {
      const snapshot = buildAdaptationSnapshot('session-1', HIGH_TRACE, baseRegulation)
      expect(snapshot.session_id).toBe('session-1')
      expect(snapshot.trace).toBe(HIGH_TRACE)
      expect(snapshot.regulation).toBe(baseRegulation)
      expect(snapshot.adaptation_level).toBe('standard')
    })
  })
})

describe('Regulation — state updates', () => {
  describe('detectDysregulationSignals', () => {
    it('detects negative self-talk', () => {
      const signals = detectDysregulationSignals("I can't do this", [])
      expect(signals.some((s) => s.type === 'negative_self_talk')).toBe(true)
    })

    it('detects avoidance patterns', () => {
      const signals = detectDysregulationSignals('whatever', [])
      expect(signals.some((s) => s.type === 'avoidance')).toBe(true)
    })

    it('detects all-caps messages', () => {
      const signals = detectDysregulationSignals('THIS IS SO CONFUSING', [])
      expect(signals.some((s) => s.type === 'all_caps')).toBe(true)
    })

    it('detects excessive punctuation', () => {
      const signals = detectDysregulationSignals('What!!!', [])
      expect(signals.some((s) => s.type === 'excessive_punctuation')).toBe(true)
    })

    it('returns no signals for neutral, well-formed text', () => {
      const signals = detectDysregulationSignals(
        'I think the main argument here relates to causality.',
        [],
      )
      expect(signals).toHaveLength(0)
    })
  })

  describe('computeRegulationDelta', () => {
    it('returns 0 for an empty signal list', () => {
      expect(computeRegulationDelta([])).toBe(0)
    })

    it('returns a negative delta when signals are present', () => {
      const signals = detectDysregulationSignals("I can't do this", [])
      expect(computeRegulationDelta(signals)).toBeLessThan(0)
    })

    it('produces a larger negative delta for higher-severity signals', () => {
      const singleLow = [{ type: 'all_caps' as const, severity: 1 as const, detail: '' }]
      const singleHigh = [{ type: 'avoidance' as const, severity: 2 as const, detail: '' }]
      expect(computeRegulationDelta(singleHigh)).toBeLessThan(computeRegulationDelta(singleLow))
    })
  })

  describe('shouldTriggerIntervention', () => {
    it('triggers when regulation level drops below 40', () => {
      const reg = { ...baseRegulation, level: 35 }
      expect(shouldTriggerIntervention(reg)).toBe(true)
    })

    it('triggers when 3 or more signals have accumulated', () => {
      const reg = {
        ...baseRegulation,
        signals: [
          { type: 'all_caps' as const, severity: 1 as const, detail: '' },
          { type: 'avoidance' as const, severity: 2 as const, detail: '' },
          { type: 'excessive_punctuation' as const, severity: 1 as const, detail: '' },
        ],
      }
      expect(shouldTriggerIntervention(reg)).toBe(true)
    })

    it('does not trigger when regulation is healthy and signals are few', () => {
      expect(shouldTriggerIntervention(baseRegulation)).toBe(false)
    })
  })
})
