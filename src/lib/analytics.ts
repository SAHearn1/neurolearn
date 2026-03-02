// Performance monitoring and analytics
// Uses Vercel Analytics when available, falls back to console logging

import { createLogger } from './logger'

const log = createLogger('analytics')

const APP_ENV = import.meta.env.VITE_APP_ENV as string | undefined

export function initAnalytics(): void {
  if (APP_ENV === 'production') {
    log.info('Analytics initialized for production')
    // When @vercel/analytics is installed:
    // import { inject } from '@vercel/analytics'
    // inject()
  } else {
    log.debug('Analytics disabled in non-production environment')
  }
}

export function trackPageView(path: string): void {
  log.debug(`Page view: ${path}`)
  // Vercel Analytics tracks page views automatically when injected
}

export function trackEvent(name: string, properties?: Record<string, string | number | boolean>): void {
  log.debug(`Event: ${name}`, properties)
  // When @vercel/analytics is installed:
  // import { track } from '@vercel/analytics'
  // track(name, properties)
}

export type WebVitalMetric = {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

export function reportWebVitals(metric: WebVitalMetric): void {
  log.debug(`Web Vital: ${metric.name} = ${metric.value} (${metric.rating})`)
  // When @vercel/speed-insights is installed:
  // import { reportWebVitals } from '@vercel/speed-insights'
  // reportWebVitals(metric)
}
