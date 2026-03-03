// Performance monitoring and analytics
// Uses Vercel Analytics when available, falls back to console logging

import { inject } from '@vercel/analytics'
import { createLogger } from './logger'

const log = createLogger('analytics')

const APP_ENV = import.meta.env.VITE_APP_ENV as string | undefined

export function initAnalytics(): void {
  if (APP_ENV === 'production') {
    log.info('Analytics initialized for production')
    inject()
  } else {
    log.debug('Analytics disabled in non-production environment')
  }
}

export function trackPageView(path: string): void {
  log.debug(`Page view: ${path}`)
  // Vercel Analytics tracks page views automatically when injected
}

export function trackEvent(
  name: string,
  properties?: Record<string, string | number | boolean>,
): void {
  log.debug(`Event: ${name}`, properties)
  // Vercel track() is called automatically via the injected script for page views.
  // Custom events use the window.va interface:
  if (typeof window !== 'undefined' && 'va' in window) {
    ;(window as unknown as { va: (cmd: string, opts: Record<string, unknown>) => void }).va(
      'event',
      { name, ...properties },
    )
  }
}

export type WebVitalMetric = {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

export function reportWebVitals(metric: WebVitalMetric): void {
  log.debug(`Web Vital: ${metric.name} = ${metric.value} (${metric.rating})`)
}

// Domain-specific analytics events
export const analytics = {
  lessonCompleted: (lessonId: string, timeSpentSeconds: number) =>
    trackEvent('lesson_completed', { lessonId, timeSpentSeconds }),

  racaSessionEnded: (sessionId: string, finalState: string, durationSeconds: number) =>
    trackEvent('raca_session_ended', { sessionId, finalState, durationSeconds }),

  pageViewed: (page: string) => trackEvent('page_viewed', { page }),
}
