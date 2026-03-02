// Sentry error tracking integration
// Install @sentry/react when ready: npm install @sentry/react
//
// This module provides a lightweight wrapper that works with or without
// the Sentry SDK installed. When VITE_SENTRY_DSN is not set, errors
// are logged to console only.

import { createLogger } from './logger'

const log = createLogger('sentry')

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined
const APP_ENV = import.meta.env.VITE_APP_ENV as string | undefined

let initialized = false

export function initErrorTracking(): void {
  if (initialized) return
  initialized = true

  if (!SENTRY_DSN) {
    log.info('Sentry DSN not configured — using console-only error tracking')
    return
  }

  log.info(`Error tracking initialized for ${APP_ENV ?? 'unknown'} environment`)

  // When @sentry/react is installed, initialize here:
  // Sentry.init({
  //   dsn: SENTRY_DSN,
  //   environment: APP_ENV ?? 'development',
  //   tracesSampleRate: APP_ENV === 'production' ? 0.1 : 1.0,
  //   replaysSessionSampleRate: 0,
  //   replaysOnErrorSampleRate: APP_ENV === 'production' ? 1.0 : 0,
  // })
}

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  const message = error instanceof Error ? error.message : String(error)
  log.error(message, context)

  // When @sentry/react is installed:
  // Sentry.captureException(error, { extra: context })
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  log[level === 'warning' ? 'warn' : level](message)

  // When @sentry/react is installed:
  // Sentry.captureMessage(message, level)
}

export function setUser(userId: string | null): void {
  if (!userId) {
    log.debug('User context cleared')
    // Sentry.setUser(null)
    return
  }
  log.debug(`User context set: ${userId}`)
  // Sentry.setUser({ id: userId })
}
