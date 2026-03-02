// Client-side rate limit tracking for auth actions
// Server-side rate limiting is handled by Supabase (30 req/min for auth endpoints)

interface RateLimitEntry {
  count: number
  resetAt: number
}

const limits = new Map<string, RateLimitEntry>()

const RATE_LIMITS = {
  'auth:signin': { max: 5, windowMs: 60_000 },
  'auth:signup': { max: 3, windowMs: 60_000 },
  'auth:reset': { max: 3, windowMs: 300_000 },
  'api:general': { max: 60, windowMs: 60_000 },
} as const

type RateLimitKey = keyof typeof RATE_LIMITS

export function checkRateLimit(key: RateLimitKey): { allowed: boolean; retryAfterMs: number } {
  const config = RATE_LIMITS[key]
  const now = Date.now()
  const entry = limits.get(key)

  if (!entry || now >= entry.resetAt) {
    limits.set(key, { count: 1, resetAt: now + config.windowMs })
    return { allowed: true, retryAfterMs: 0 }
  }

  if (entry.count >= config.max) {
    return { allowed: false, retryAfterMs: entry.resetAt - now }
  }

  entry.count += 1
  return { allowed: true, retryAfterMs: 0 }
}

export function formatRetryMessage(retryAfterMs: number): string {
  const seconds = Math.ceil(retryAfterMs / 1000)
  if (seconds < 60) return `Please wait ${seconds} seconds before trying again.`
  const minutes = Math.ceil(seconds / 60)
  return `Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before trying again.`
}
