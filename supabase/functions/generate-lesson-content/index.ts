import { authenticate, requireRole } from '../_shared/authz.ts'
import { enforceRateLimit, getRateLimitKey } from '../_shared/rate-limit.ts'
import { handleError, json, preflight, rejectDisallowedOrigin } from '../_shared/response.ts'

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? ''
const AI_MODEL = Deno.env.get('RACA_AI_MODEL') ?? 'claude-sonnet-4-6'

interface GenerateRequest {
  lesson_id: string
  learning_styles?: string[]
  accessibility?: {
    text_size?: string
    reduce_motion?: boolean
    high_contrast?: boolean
    screen_reader_hints?: boolean
  }
  /** AI-08/#320: TRACE fluency profile from last epistemic evaluation */
  traceProfile?: Record<string, number>
  /** AI-08/#320: Active CCSS standard codes for this lesson */
  ccssStandardCodes?: string[]
  /** AI-08/#320: Outcome from learner's most recent prior session */
  priorSessionOutcome?: 'proficient' | 'in_progress' | 'developing' | 'not_started'
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return preflight(req)

  const blockedOrigin = rejectDisallowedOrigin(req)
  if (blockedOrigin) return blockedOrigin

  try {
    const ctx = await authenticate(req)
    requireRole(ctx, ['learner', 'educator', 'admin'])

    const limited = enforceRateLimit({
      key: getRateLimitKey(req, ctx.userId),
      limit: 20,
      windowMs: 60_000,
      req,
    })
    if (limited) return limited

    const body: GenerateRequest = await req.json()
    if (!body.lesson_id) return json({ error: 'lesson_id is required' }, 400, req)

    // Fetch lesson + course context
    const { data: lesson, error: lessonErr } = await ctx.adminClient
      .from('lessons')
      .select('id, title, description, type, course_id, content')
      .eq('id', body.lesson_id)
      .single()

    if (lessonErr || !lesson) return json({ error: 'Lesson not found' }, 404, req)

    // Use cached content only when no personalization context is provided.
    // TRACE profile, CCSS standards, or a prior session outcome all require fresh generation.
    const hasPersonalization =
      body.traceProfile !== undefined ||
      (body.ccssStandardCodes && body.ccssStandardCodes.length > 0) ||
      (body.priorSessionOutcome && body.priorSessionOutcome !== 'not_started')

    if (lesson.content && !hasPersonalization) {
      return json({ content: lesson.content, cached: true }, 200, req)
    }

    const { data: course } = await ctx.adminClient
      .from('courses')
      .select('title, description, level')
      .eq('id', lesson.course_id)
      .single()

    const learningStyleGuide = buildLearningStyleGuide(body.learning_styles ?? [])
    const accessibilityGuide = buildAccessibilityGuide(body.accessibility ?? {})
    const traceGuide = buildTraceGuide(body.traceProfile)
    const ccssGuide = buildCcssGuide(body.ccssStandardCodes ?? [])
    const priorOutcomeGuide = buildPriorOutcomeGuide(body.priorSessionOutcome)

    const systemPrompt = `You are an expert instructional designer creating lesson content for NeuroLearn, a platform for neurodivergent learners.

Your content must be:
- Trauma-informed: calm, affirming, never shaming or pressuring
- Neurodivergent-affirming: written for ADHD, autistic, dyslexic, and twice-exceptional learners
- Clear and direct: short sentences, concrete examples, no jargon
- Chunked: break information into digestible pieces with clear headings
- Asset-based: focus on strengths and strategies, never deficits

${learningStyleGuide}
${accessibilityGuide}
${traceGuide}
${ccssGuide}
${priorOutcomeGuide}

Output format: Return ONLY valid HTML using semantic tags (h2, h3, p, ul, li, strong, em). No markdown. No explanations. No preamble. Start directly with content.`

    const userPrompt = `Generate lesson content for:

Course: ${course?.title ?? 'Unknown'} (${course?.level ?? 'beginner'} level)
Course description: ${course?.description ?? ''}
Lesson title: ${lesson.title}
Lesson description: ${lesson.description}
Lesson type: ${lesson.type}

Write approximately 300-500 words of lesson content. Include:
1. A brief engaging introduction (1-2 sentences)
2. The main concepts broken into 2-3 clearly headed sections
3. A practical takeaway or action step at the end

For interactive lessons, include a simple self-reflection prompt or activity.
For quiz lessons, include a reflection question (not a multiple-choice test).`

    const content = await callClaude(systemPrompt, userPrompt)

    // Cache the generated content only for non-personalized requests (base content).
    // Personalized responses are ephemeral — caching them would overwrite the base.
    if (!hasPersonalization) {
      await ctx.adminClient.from('lessons').update({ content }).eq('id', body.lesson_id)
    }

    return json({ content, cached: false }, 200, req)
  } catch (err) {
    console.error('generate-lesson-content error:', err)
    return handleError(err, req)
  }
})

async function callClaude(system: string, user: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: AI_MODEL,
      max_tokens: 1200,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`AI API error ${response.status}: ${text}`)
  }

  const data = await response.json()
  return data.content?.[0]?.text ?? ''
}

function buildLearningStyleGuide(styles: string[]): string {
  if (!styles.length) return ''
  const guides: Record<string, string> = {
    visual:
      'Use spatial metaphors and visual descriptions. Suggest diagrams or visual organization.',
    auditory:
      'Use rhythm and patterns in explanations. Include language like "sounds like" or "listen for".',
    kinesthetic:
      'Include movement or hands-on suggestions. Use active verbs. Reference physical sensations.',
    reading:
      'Provide structured text with clear hierarchy. Include definitions and precise language.',
  }
  const active = styles
    .filter((s) => guides[s])
    .map((s) => guides[s])
    .join(' ')
  return active ? `Learning style adaptations: ${active}` : ''
}

function buildAccessibilityGuide(a: GenerateRequest['accessibility']): string {
  const notes: string[] = []
  if (a?.screen_reader_hints)
    notes.push('Use descriptive alt-text patterns and avoid relying on visual-only cues.')
  if (a?.reduce_motion) notes.push('Do not reference animations or motion-based interactions.')
  return notes.length ? `Accessibility notes: ${notes.join(' ')}` : ''
}

function buildTraceGuide(traceProfile: Record<string, number> | undefined): string {
  if (!traceProfile) return ''
  let weakDim: string | null = null
  let weakScore = Infinity
  for (const [dim, score] of Object.entries(traceProfile)) {
    if (typeof score === 'number' && score < weakScore) {
      weakScore = score
      weakDim = dim
    }
  }
  if (weakDim === null) return ''
  if (weakScore > 7) {
    return 'TRACE note: The learner demonstrates strong fluency across all thinking dimensions. Include extension challenges and synthesis prompts.'
  }
  const dimDescriptions: Record<string, string> = {
    think: 'broad initial thinking and idea generation',
    reason: 'explicit logical reasoning and justification',
    articulate: 'clear expression and precise language',
    check: 'self-correction and verification of claims',
    extend: 'connecting ideas to new contexts',
    ethical: 'ethical consideration and values reasoning',
  }
  const desc = dimDescriptions[weakDim] ?? weakDim
  return `TRACE note: The learner's weakest fluency dimension is '${weakDim}' (score ${weakScore.toFixed(1)}/10 — ${desc}). Embed prompts, examples, and activities that specifically develop ${desc}.`
}

function buildCcssGuide(ccssStandardCodes: string[]): string {
  if (ccssStandardCodes.length === 0) return ''
  const codeList = ccssStandardCodes.slice(0, 4).join(', ')
  return `Standards alignment: This lesson targets ${codeList}. Ensure the content, examples, and activities directly develop the skills described by these standards.`
}

function buildPriorOutcomeGuide(
  outcome: 'proficient' | 'in_progress' | 'developing' | 'not_started' | undefined,
): string {
  if (!outcome || outcome === 'not_started') return ''
  const guides: Record<string, string> = {
    proficient:
      'Prior session: The learner achieved proficiency on this lesson in a prior session. Generate extension content that pushes toward deeper application and transfer rather than re-covering foundational material.',
    in_progress:
      'Prior session: The learner engaged with this lesson but is still developing. Briefly acknowledge the prior effort; emphasize the next conceptual step forward.',
    developing:
      'Prior session: The learner is early in their engagement with this material. Use patient scaffolding, concrete examples, and affirming framing.',
  }
  return guides[outcome] ?? ''
}
