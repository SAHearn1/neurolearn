// supabase/functions/rate-limit-middleware/index.ts
// Edge Function: Server-side rate limiting middleware
//
// Returns 429 when rate limited, { allowed: true } when allowed.
// Uses in-memory tracking (resets on cold start — acceptable for MVP).

import { corsHeadersFor, preflight } from '../_shared/response.ts'

// Simple in-memory rate limiter
const requests = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = requests.get(ip)
  if (!entry || now > entry.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + windowMs })
    return false
  }
  if (entry.count >= limit) return true
  entry.count++
  return false
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return preflight(req)
  }

  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const url = new URL(req.url)
  const isAuth = url.pathname.includes('/auth/')
  const limit = isAuth ? 5 : 100

  if (isRateLimited(ip, limit, 60_000)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: {
        ...corsHeadersFor(req),
        'Content-Type': 'application/json',
        'Retry-After': '60',
      },
    })
  }

  return new Response(JSON.stringify({ allowed: true }), {
    headers: { ...corsHeadersFor(req), 'Content-Type': 'application/json' },
  })
})
