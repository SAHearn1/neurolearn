import { useCallback } from 'react'
import { supabase } from '../../utils/supabase/client'
import { useAuthStore } from '../store/authStore'
import {
  extractSkillEvidence,
  saveSkillEvidence,
} from '../lib/intelligence/skill-evidence-extractor'

/**
 * Hook that exposes saveEvidence() for use in session components.
 * AI-04: Formative Skill Evidence Collection.
 */
export function useSkillEvidence(
  sessionId: string,
  lessonId?: string,
): {
  saveEvidence: (
    artifactText: string,
    cognitiveState: string,
    agentId: string,
    artifactId?: string,
  ) => Promise<void>
} {
  const user = useAuthStore((s) => s.user)

  const saveEvidence = useCallback(
    async (
      artifactText: string,
      cognitiveState: string,
      agentId: string,
      artifactId?: string,
    ): Promise<void> => {
      if (!user?.id) return

      const extracted = extractSkillEvidence(artifactText, cognitiveState, agentId)
      await saveSkillEvidence(supabase, {
        ...extracted,
        userId: user.id,
        sessionId,
        lessonId,
        artifactId,
      })
    },
    [user, sessionId, lessonId],
  )

  return { saveEvidence }
}
