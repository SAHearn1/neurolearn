// supabase/functions/tts-generate/index.ts
// #230: ElevenLabs TTS Edge Function
//
// POST { text: string, voice_id?: string }
// Returns: audio/mpeg binary                     (when ELEVENLABS_API_KEY is set)
//          JSON { error, fallback: true } / 503  (when key is missing)

import { authenticate } from '../_shared/authz.ts'
import { enforceRateLimit, getRateLimitKey } from '../_shared/rate-limit.ts'
import {
  handleError,
  json,
  preflight,
  rejectDisallowedOrigin,
  corsHeadersFor,
} from '../_shared/response.ts'

const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY') ?? ''
// ElevenLabs "Rachel" — clear, warm, English-US
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM'
const MAX_TEXT_CHARS = 5000

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return preflight(req)

  const blocked = rejectDisallowedOrigin(req)
  if (blocked) return blocked

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, req)
  }

  try {
    const ctx = await authenticate(req)

    const limited = enforceRateLimit({
      key: getRateLimitKey(req, ctx.userId),
      limit: 20,
      windowMs: 60_000,
      req,
    })
    if (limited) return limited

    // Signal graceful fallback when ElevenLabs is not configured
    if (!ELEVENLABS_API_KEY) {
      return json({ error: 'TTS service not configured', fallback: true }, 503, req)
    }

    const body = await req.json()
    const text: string = body.text ?? ''
    const voiceId: string =
      typeof body.voice_id === 'string' && body.voice_id.trim()
        ? body.voice_id.trim()
        : DEFAULT_VOICE_ID

    if (!text.trim()) {
      return json({ error: 'text is required' }, 400, req)
    }
    if (text.length > MAX_TEXT_CHARS) {
      return json({ error: `text exceeds ${MAX_TEXT_CHARS} character limit` }, 400, req)
    }

    const elRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    })

    if (!elRes.ok) {
      const errText = await elRes.text()
      console.error(`ElevenLabs error ${elRes.status}:`, errText)
      return json({ error: `TTS service error: ${elRes.status}`, fallback: true }, 502, req)
    }

    const audioBuffer = await elRes.arrayBuffer()

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'private, max-age=3600',
        ...corsHeadersFor(req),
      },
    })
  } catch (err) {
    console.error('tts-generate error:', err)
    return handleError(err, req)
  }
})
