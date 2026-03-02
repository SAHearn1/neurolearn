// CORS configuration for Supabase Edge Functions
// Vercel handles browser CORS headers automatically for same-origin requests.
// This configuration is used by Edge Functions that handle cross-origin requests.

export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': import.meta.env.VITE_APP_URL ?? 'http://localhost:5173',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
  'Access-Control-Max-Age': '86400',
} as const

export function createCorsHeaders(origin?: string): Record<string, string> {
  const allowedOrigins = [
    import.meta.env.VITE_APP_URL ?? 'http://localhost:5173',
    'https://neurolearn-one.vercel.app',
  ]

  const effectiveOrigin =
    origin && allowedOrigins.includes(origin)
      ? origin
      : allowedOrigins[0]

  return {
    ...CORS_HEADERS,
    'Access-Control-Allow-Origin': effectiveOrigin,
  }
}
