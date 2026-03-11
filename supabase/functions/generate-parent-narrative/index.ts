// PAR-05: Generate Parent Narrative Edge Function
// Accepts POST: { userId, sessionIdentifier, masteryScore, statesCompleted, artifactWordCount }
// Generates a warm, score-free narrative for parents and saves to session_parent_narratives

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { json, preflight, rejectDisallowedOrigin, handleError } from '../_shared/response.ts'

interface NarrativeRequest {
  userId: string
  sessionIdentifier: string
  masteryScore: number
  statesCompleted: number
  artifactWordCount: number
}

/**
 * Heuristic narrative builder — generates a warm parent-facing summary
 * without calling Claude. TODO: wire Claude API for richer narratives.
 */
function buildHeuristicNarrative(statesCompleted: number, artifactWordCount: number): string {
  const effort =
    statesCompleted >= 7
      ? 'went all the way through a full learning journey'
      : statesCompleted >= 4
        ? 'worked through several important thinking steps'
        : statesCompleted >= 2
          ? 'made a solid start and engaged with the material'
          : 'began a new learning session'

  const depth =
    artifactWordCount >= 200
      ? 'sharing their thinking in rich detail'
      : artifactWordCount >= 50
        ? 'putting their ideas into words'
        : 'exploring the topic at their own pace'

  const encouragement =
    statesCompleted >= 6
      ? 'This kind of deep engagement builds lasting understanding.'
      : 'Every session like this is a step forward in how they think and learn.'

  return (
    `In today's learning session, your child ${effort}, ${depth}. ` +
    `They showed real persistence and curiosity throughout their work. ` +
    `${encouragement}`
  )
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return preflight(req)

  const blocked = rejectDisallowedOrigin(req)
  if (blocked) return blocked

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, req)
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const body: NarrativeRequest = await req.json()
    const { userId, sessionIdentifier, statesCompleted, artifactWordCount } = body

    if (!userId || !sessionIdentifier) {
      return json({ error: 'userId and sessionIdentifier are required' }, 400, req)
    }

    const narrativeText = buildHeuristicNarrative(statesCompleted, artifactWordCount)

    const { error: insertError } = await supabase.from('session_parent_narratives').upsert(
      {
        user_id: userId,
        session_identifier: sessionIdentifier,
        narrative_text: narrativeText,
        generated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,session_identifier' },
    )

    if (insertError) {
      console.error('Failed to save narrative:', insertError)
      return json({ error: 'Failed to save narrative' }, 500, req)
    }

    return json({ narrativeText }, 200, req)
  } catch (err) {
    return handleError(err, req)
  }
})
