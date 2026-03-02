// In-memory sliding window rate limiter
// Key = identifier (e.g. 'auth:login'), limit = max requests, windowMs = window in ms

const buckets = new Map<string, number[]>()

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const timestamps = buckets.get(key) ?? []
  // Remove timestamps outside window
  const recent = timestamps.filter((ts) => now - ts < windowMs)
  if (recent.length >= limit) return false // Rate limited
  recent.push(now)
  buckets.set(key, recent)
  return true // Allowed
}

export function resetRateLimit(key: string): void {
  buckets.delete(key)
}

// Pre-configured limiters
export const authRateLimit = (identifier: string): boolean =>
  checkRateLimit(`auth:${identifier}`, 5, 60_000) // 5 per minute

export const apiRateLimit = (identifier: string): boolean =>
  checkRateLimit(`api:${identifier}`, 100, 60_000) // 100 per minute
