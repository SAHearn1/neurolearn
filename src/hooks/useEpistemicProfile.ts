import { useCallback, useMemo } from 'react'
import { useRuntimeStore } from '../lib/raca/layer0-runtime/runtime-store'
import { scoreTRACE } from '../lib/raca/layer4-epistemic/fluency-tracker'
import { determineAdaptationLevel, getAdaptationConfig } from '../lib/raca/layer4-epistemic/adaptation-engine'
import {
  detectDysregulationSignals,
  computeRegulationDelta,
  shouldTriggerIntervention,
} from '../lib/raca/layer4-epistemic/availability-detector'
import { buildAdaptationSnapshot } from '../lib/raca/layer4-epistemic/adaptation-engine'
import { racaFlags } from '../lib/raca/feature-flags'
import type { RegulationState } from '../lib/raca/types/epistemic'

export function useEpistemicProfile() {
  const regulation = useRuntimeStore((s) => s.regulation)
  const artifacts = useRuntimeStore((s) => s.artifacts)
  const sessionId = useRuntimeStore((s) => s.session_id)
  const dispatch = useRuntimeStore((s) => s.dispatch)

  const trace = useMemo(() => scoreTRACE(artifacts), [artifacts])

  const adaptationLevel = useMemo(
    () => determineAdaptationLevel(regulation, trace),
    [regulation, trace],
  )

  const adaptationConfig = useMemo(
    () => getAdaptationConfig(adaptationLevel),
    [adaptationLevel],
  )

  const processMessage = useCallback(
    (
      message: string,
      recentMessages: Array<{ text: string; timestamp: string }>,
    ) => {
      if (!racaFlags.epistemicMonitoring) return

      const signals = detectDysregulationSignals(message, recentMessages)
      if (signals.length === 0) return

      const delta = computeRegulationDelta(signals)
      const newLevel = Math.max(0, Math.min(100, regulation.level + delta))
      const updated: RegulationState = {
        ...regulation,
        level: newLevel,
        signals: [...regulation.signals, ...signals],
        last_check: new Date().toISOString(),
      }

      if (shouldTriggerIntervention(updated) && !updated.intervention_active) {
        updated.intervention_active = true
        updated.intervention_count += 1
      }

      dispatch({ type: 'REGULATION_UPDATED', regulation: updated })

      // Record epistemic snapshot
      if (sessionId) {
        const snapshot = buildAdaptationSnapshot(sessionId, trace, updated)
        dispatch({ type: 'EPISTEMIC_SNAPSHOT_ADDED', snapshot })
      }
    },
    [regulation, trace, sessionId, dispatch],
  )

  const dismissIntervention = useCallback(() => {
    dispatch({
      type: 'REGULATION_UPDATED',
      regulation: { ...regulation, intervention_active: false },
    })
  }, [regulation, dispatch])

  return {
    regulation,
    trace,
    adaptationLevel,
    adaptationConfig,
    isIntervening: regulation.intervention_active,
    processMessage,
    dismissIntervention,
  }
}
