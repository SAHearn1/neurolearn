import { json } from './response.ts'

const requests = new Map<string, { count: number; resetAt: number }>()

interface RateLimitOptions {
  key: string
  limit: number
  windowMs: number
  req: Request
}

export function getRateLimitKey(req: Request, userId: string): string {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  return `${userId}:${ip}`
}

export function enforceRateLimit(options: RateLimitOptions): Response | null {
  const now = Date.now()
  const entry = requests.get(options.key)

  if (!entry || now > entry.resetAt) {
    requests.set(options.key, { count: 1, resetAt: now + options.windowMs })
    return null
  }

  if (entry.count >= options.limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000))
    const response = json(
      {
        error: 'Rate limit exceeded',
        retry_after_seconds: retryAfterSeconds,
      },
      429,
      options.req,
    )
    response.headers.set('Retry-After', String(retryAfterSeconds))
    return response
  }

  entry.count += 1
  return null
}
