// supabase/functions/_shared/response.ts
// Shared CORS headers and response helpers for all edge functions.

const configuredOrigins = (Deno.env.get('ALLOWED_ORIGINS') ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const vercelUrl = Deno.env.get('VERCEL_URL')
if (vercelUrl) configuredOrigins.push(`https://${vercelUrl}`)

const allowedOrigins = [...new Set(configuredOrigins)]
const fallbackOrigin = allowedOrigins[0] ?? 'http://localhost:5173'

export function resolveCorsOrigin(req: Request): string | null {
  const origin = req.headers.get('origin')
  if (!origin) return fallbackOrigin
  return allowedOrigins.includes(origin) ? origin : null
}

export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': fallbackOrigin,
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
  Vary: 'Origin',
}

export function corsHeadersFor(req: Request): Record<string, string> {
  const origin = resolveCorsOrigin(req)
  return {
    ...corsHeaders,
    ...(origin ? { 'Access-Control-Allow-Origin': origin } : {}),
  }
}

export function rejectDisallowedOrigin(req: Request): Response | null {
  const origin = req.headers.get('origin')
  if (!origin) return null
  if (resolveCorsOrigin(req)) return null
  return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
    status: 403,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

export function preflight(req: Request): Response {
  const blocked = rejectDisallowedOrigin(req)
  if (blocked) return blocked
  return new Response(null, { headers: corsHeadersFor(req) })
}

/** Return a JSON response with CORS headers. */
export function json(data: unknown, status = 200, req?: Request): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...(req ? corsHeadersFor(req) : corsHeaders), 'Content-Type': 'application/json' },
  })
}

/** Return a JSON error response with CORS headers. */
export function error(message: string, status: number, req?: Request): Response {
  return json({ error: message }, status, req)
}

/**
 * Duck-type an unknown thrown value into an HTTP response.
 * Checks for a `.status` property to preserve structured errors.
 */
export function handleError(err: unknown, req?: Request): Response {
  if (err instanceof Error && 'status' in err) {
    const status = (err as { status: number }).status
    return error(err.message, status, req)
  }
  console.error('Unhandled edge function error:', err)
  return error('Internal server error', 500, req)
}
