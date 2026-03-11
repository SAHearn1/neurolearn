import type { SupabaseClient } from '@supabase/supabase-js'

export interface SkillEvidence {
  userId: string
  sessionId: string
  lessonId?: string
  artifactId?: string
  cognitiveState: string
  agentId: string
  evidenceType: 'skill_demonstrated' | 'misconception' | 'partial_understanding' | 'no_evidence'
  skillCode?: string
  confidence: number
  artifactExcerpt?: string
}

const CONNECTIVE_WORDS =
  /\b(because|therefore|however|thus|consequently|hence|moreover|furthermore|although|whereas)\b/i

const UNCERTAINTY_PHRASES =
  /\b(I think maybe|not sure|I don't know|I'm not sure|I'm unsure|not certain|maybe|perhaps I)\b/i

const STATE_SKILL_MAP: Record<string, string> = {
  APPLY: 'critical-thinking',
  DEFEND: 'argumentation',
  REVISE: 'self-regulation',
  PLAN: 'planning',
  POSITION: 'framing',
  RECONNECT: 'reflection',
  ROOT: 'orientation',
  REGULATE: 'self-awareness',
  ARCHIVE: 'synthesis',
}

/**
 * Heuristic extractor — analyses artifact text for evidence signals.
 */
export function extractSkillEvidence(
  artifactText: string,
  cognitiveState: string,
  agentId: string,
): Omit<SkillEvidence, 'userId' | 'sessionId' | 'lessonId'> {
  const wordCount = artifactText.trim().split(/\s+/).filter(Boolean).length
  const skillCode = STATE_SKILL_MAP[cognitiveState] ?? 'general'

  if (wordCount < 50) {
    return {
      cognitiveState,
      agentId,
      evidenceType: 'no_evidence',
      skillCode,
      confidence: 0.9,
      artifactExcerpt: artifactText.slice(0, 200),
    }
  }

  if (UNCERTAINTY_PHRASES.test(artifactText)) {
    return {
      cognitiveState,
      agentId,
      evidenceType: 'partial_understanding',
      skillCode,
      confidence: 0.5,
      artifactExcerpt: artifactText.slice(0, 200),
    }
  }

  if (wordCount > 200 && CONNECTIVE_WORDS.test(artifactText)) {
    return {
      cognitiveState,
      agentId,
      evidenceType: 'skill_demonstrated',
      skillCode,
      confidence: 0.7,
      artifactExcerpt: artifactText.slice(0, 200),
    }
  }

  return {
    cognitiveState,
    agentId,
    evidenceType: 'partial_understanding',
    skillCode,
    confidence: 0.4,
    artifactExcerpt: artifactText.slice(0, 200),
  }
}

/**
 * Persists skill evidence to the skill_evidence_events table.
 * Swallows errors — this is a non-critical analytics path.
 */
export async function saveSkillEvidence(
  client: SupabaseClient,
  evidence: SkillEvidence,
): Promise<void> {
  try {
    await client.from('skill_evidence_events').insert({
      user_id: evidence.userId,
      session_id: evidence.sessionId,
      lesson_id: evidence.lessonId ?? null,
      artifact_id: evidence.artifactId ?? null,
      cognitive_state: evidence.cognitiveState,
      agent_id: evidence.agentId,
      evidence_type: evidence.evidenceType,
      skill_code: evidence.skillCode ?? null,
      confidence: evidence.confidence,
      artifact_excerpt: evidence.artifactExcerpt ?? null,
    })
  } catch {
    // Non-critical path — swallow silently
  }
}
