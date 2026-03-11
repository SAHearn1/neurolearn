import { useState, useCallback } from 'react'
import { useRuntimeStore } from '../lib/raca/layer0-runtime/runtime-store'
import { routeAgentRequest } from '../lib/raca/layer2-agent-router/router'
import { buildPromptBundle } from '../lib/raca/layer3-agents/prompt-templates'
import { buildAgentResponse } from '../lib/raca/layer3-agents/output-validator'
import { checkFullCompliance } from '../lib/raca/guardrails/raca-compliance'
import { recordEvent } from '../lib/raca/layer0-runtime/session-manager'
import { racaFlags } from '../lib/raca/feature-flags'
import { supabase } from '../../utils/supabase/client'
import { useAuthStore } from '../store/authStore'
import type { AgentId, AgentResponse } from '../lib/raca/types/agents'
import type { AgentContext } from '../lib/raca/layer3-agents/agent-base'

/** AI-09/#323: Session-level personalization injected into every agent invocation */
export interface AgentSessionPersonalization {
  traceProfile?: Record<string, number>
  ccssStandardCodes?: string[]
  priorSessionOutcome?: AgentContext['priorSessionOutcome']
}

export function useAgent(personalization?: AgentSessionPersonalization) {
  const [loading, setLoading] = useState(false)
  const [lastResponse, setLastResponse] = useState<AgentResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const session = useAuthStore((s) => s.session)

  const invoke = useCallback(
    async (agentId: AgentId, learnerInput: string): Promise<AgentResponse | null> => {
      setError(null)
      setLoading(true)

      try {
        const store = useRuntimeStore.getState()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { dispatch, ...runtimeState } = store

        // Route check
        const route = routeAgentRequest(agentId, runtimeState)
        if (!route.allowed) {
          recordEvent('agent_blocked', 'system', {
            agent_id: agentId,
            reason: route.reason,
          })
          setError(route.reason)
          return null
        }

        // Build context
        const context: AgentContext = {
          sessionId: runtimeState.session_id ?? '',
          state: runtimeState.current_state,
          regulation_level: runtimeState.regulation.level,
          artifacts: runtimeState.artifacts,
          epistemic:
            runtimeState.epistemic_snapshots[runtimeState.epistemic_snapshots.length - 1] ?? null,
          learner_input: learnerInput,
          session_history: runtimeState.events
            .filter((e) => e.kind === 'agent_responded' || e.kind === 'reflection_submitted')
            .slice(-5)
            .map((e) => `[${e.kind}] ${JSON.stringify(e.payload).slice(0, 100)}`),
          accessibility: { text_size: 'medium', reduce_motion: true },
          // AI-09/#323: session-level personalization (TRACE profile, CCSS codes, prior outcome)
          traceProfile: personalization?.traceProfile,
          ccssStandardCodes: personalization?.ccssStandardCodes,
          priorSessionOutcome: personalization?.priorSessionOutcome,
        }

        // Build prompt
        const bundle = buildPromptBundle(agentId, context)

        recordEvent('agent_invoked', 'system', { agent_id: agentId })

        // Call edge function
        const { data, error: fnError } = await supabase.functions.invoke('agent-invoke', {
          body: {
            session_id: runtimeState.session_id,
            agent_id: agentId,
            learner_input: bundle.user,
            system_prompt: bundle.system,
            max_tokens: bundle.maxTokens,
          },
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        })

        if (fnError) throw fnError

        const rawContent = data?.content ?? ''

        // Validate output with guardrails
        if (racaFlags.guardrails) {
          const compliance = checkFullCompliance(agentId, rawContent, context)
          if (!compliance.passed) {
            recordEvent('agent_blocked', 'system', {
              agent_id: agentId,
              violations: compliance.violations,
            })
            setError(`Agent response blocked: ${compliance.violations.join(', ')}`)
            return null
          }
        }

        // Build validated response
        const response = buildAgentResponse(agentId, rawContent, context)

        recordEvent('agent_responded', 'agent_response', {
          agent_id: agentId,
          word_count: rawContent.split(/\s+/).length,
          questions: response.reflective_questions.length,
        })

        setLastResponse(response)
        return response
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Agent invocation failed'
        setError(message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [session?.access_token, personalization],
  )

  return {
    invoke,
    loading,
    lastResponse,
    error,
    clearError: () => setError(null),
  }
}
