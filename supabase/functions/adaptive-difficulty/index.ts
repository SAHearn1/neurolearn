// supabase/functions/adaptive-difficulty/index.ts
// AI-06: Adaptive Difficulty Engine
//
// POST { userId, lessonId, score, duration }
//   - score: float 0.0–1.0
//   - duration: number (milliseconds)
//
// Returns { difficulty, mastery_score, recommended_lesson_id }

import { authenticate, requireRole } from '../_shared/authz.ts'
import { enforceRateLimit, getRateLimitKey } from '../_shared/rate-limit.ts'
import { handleError, json, preflight, rejectDisallowedOrigin } from '../_shared/response.ts'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EMA_ALPHA = 0.3
const RECENT_SCORES_WINDOW = 5
const DIFFICULTY_NUDGE = 0.05
const HIGH_SCORE_THRESHOLD = 0.85
const LOW_SCORE_THRESHOLD = 0.6
const MIN_SESSIONS_FOR_NUDGE_UP = 3

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AdaptiveDifficultyRequest {
  userId: string
  lessonId: string
  score: number
  duration: number
}

interface AdaptiveLearningRow {
  id: string
  current_difficulty_float: number | null
  mastery_score_float: number | null
  recent_scores: number[] | null
  recommended_lesson_id: string | null
  course_id: string
}

interface AdaptiveDifficultyResponse {
  difficulty: number
  mastery_score: number
  recommended_lesson_id: string | null
}

// ---------------------------------------------------------------------------
// EMA helper
// ---------------------------------------------------------------------------

function computeEma(currentEma: number, newValue: number, alpha: number): number {
  return alpha * newValue + (1 - alpha) * currentEma
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// ---------------------------------------------------------------------------
// Core logic
// ---------------------------------------------------------------------------

function adjustDifficulty(currentDifficulty: number, score: number, sessionCount: number): number {
  let newDifficulty = currentDifficulty

  if (score >= HIGH_SCORE_THRESHOLD && sessionCount >= MIN_SESSIONS_FOR_NUDGE_UP) {
    newDifficulty = currentDifficulty + DIFFICULTY_NUDGE
  } else if (score < LOW_SCORE_THRESHOLD) {
    newDifficulty = currentDifficulty - DIFFICULTY_NUDGE
  }

  return clamp(newDifficulty, 0.0, 1.0)
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return preflight(req)

  const blockedOrigin = rejectDisallowedOrigin(req)
  if (blockedOrigin) return blockedOrigin

  try {
    const ctx = await authenticate(req)
    requireRole(ctx, ['learner', 'admin'])

    const limited = enforceRateLimit({
      key: getRateLimitKey(req, ctx.userId),
      limit: 60,
      windowMs: 60_000,
      req,
    })
    if (limited) return limited

    const body: AdaptiveDifficultyRequest = await req.json()

    // Validate request
    if (
      !body.userId ||
      !body.lessonId ||
      typeof body.score !== 'number' ||
      typeof body.duration !== 'number'
    ) {
      return json(
        { error: 'Invalid request body. Required: userId, lessonId, score, duration' },
        400,
        req,
      )
    }

    if (body.score < 0 || body.score > 1) {
      return json({ error: 'score must be a float between 0.0 and 1.0' }, 400, req)
    }

    // Ensure the caller can only update their own record
    if (body.userId !== ctx.userId && ctx.role !== 'admin') {
      return json({ error: "Forbidden: cannot update another user's adaptive state" }, 403, req)
    }

    // Fetch the lesson to get its course_id
    const { data: lesson, error: lessonErr } = await ctx.adminClient
      .from('lessons')
      .select('id, course_id')
      .eq('id', body.lessonId)
      .single()

    if (lessonErr || !lesson) {
      return json({ error: 'Lesson not found' }, 404, req)
    }

    const courseId = lesson.course_id

    // Fetch current adaptive_learning_state
    const { data: existingState, error: stateErr } = await ctx.adminClient
      .from('adaptive_learning_state')
      .select(
        'id, current_difficulty_float, mastery_score_float, recent_scores, recommended_lesson_id, course_id',
      )
      .eq('user_id', body.userId)
      .eq('course_id', courseId)
      .maybeSingle()

    if (stateErr) {
      console.error('adaptive_learning_state fetch error:', stateErr)
      return json({ error: 'Failed to fetch adaptive state' }, 500, req)
    }

    const state = existingState as AdaptiveLearningRow | null

    // Current values (use defaults if this is a new record)
    const currentDifficulty = state?.current_difficulty_float ?? 0.1
    const currentMastery = state?.mastery_score_float ?? 0.0
    const recentScores: number[] = state?.recent_scores ?? []

    // Update recent scores window
    const updatedScores = [...recentScores, body.score].slice(-RECENT_SCORES_WINDOW)
    const sessionCount = updatedScores.length

    // Compute new difficulty
    const newDifficulty = adjustDifficulty(currentDifficulty, body.score, sessionCount)

    // Compute new mastery via EMA
    const newMastery = clamp(computeEma(currentMastery, body.score, EMA_ALPHA), 0.0, 1.0)

    // Find a recommended lesson based on new difficulty band
    // difficulty 0-0.33 → easiest lessons, 0.34-0.66 → medium, 0.67-1.0 → hard
    let recommendedDifficultyLevel: number
    if (newDifficulty <= 0.33) {
      recommendedDifficultyLevel = 1
    } else if (newDifficulty <= 0.66) {
      recommendedDifficultyLevel = 3
    } else {
      recommendedDifficultyLevel = 5
    }

    const { data: recommendedLesson } = await ctx.adminClient
      .from('lessons')
      .select('id')
      .eq('course_id', courseId)
      .eq('difficulty_level', recommendedDifficultyLevel)
      .neq('id', body.lessonId)
      .limit(1)
      .maybeSingle()

    const recommendedLessonId = recommendedLesson?.id ?? state?.recommended_lesson_id ?? null

    // Upsert the adaptive_learning_state record
    const { error: upsertErr } = await ctx.adminClient.from('adaptive_learning_state').upsert({
      user_id: body.userId,
      course_id: courseId,
      current_difficulty_float: newDifficulty,
      mastery_score_float: newMastery,
      recent_scores: updatedScores,
      recommended_lesson_id: recommendedLessonId,
      last_assessment_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (upsertErr) {
      console.error('adaptive_learning_state upsert error:', upsertErr)
      return json({ error: 'Failed to update adaptive state' }, 500, req)
    }

    const response: AdaptiveDifficultyResponse = {
      difficulty: newDifficulty,
      mastery_score: newMastery,
      recommended_lesson_id: recommendedLessonId,
    }

    return json(response, 200, req)
  } catch (err) {
    console.error('adaptive-difficulty error:', err)
    return handleError(err, req)
  }
})
