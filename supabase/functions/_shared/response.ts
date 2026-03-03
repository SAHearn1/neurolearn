// supabase/functions/_shared/response.ts
// Shared CORS headers and response helpers for all edge functions.

export const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
}

/** Return a JSON response with CORS headers. */
export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

/** Return a JSON error response with CORS headers. */
export function error(message: string, status: number): Response {
  return json({ error: message }, status)
}

/**
 * Duck-type an unknown thrown value into an HTTP response.
 * Checks for a `.status` property to preserve structured errors.
 */
export function handleError(err: unknown): Response {
  if (err instanceof Error && 'status' in err) {
    const status = (err as { status: number }).status
    return error(err.message, status)
  }
  console.error('Unhandled edge function error:', err)
  return error('Internal server error', 500)
}
