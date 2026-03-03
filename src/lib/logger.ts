import * as Sentry from '@sentry/react'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const currentLevel: LogLevel = (import.meta.env.VITE_LOG_LEVEL as LogLevel) ?? 'info'

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel]
}

function formatMessage(level: LogLevel, module: string, message: string): string {
  const timestamp = new Date().toISOString()
  return `[${timestamp}] [${level.toUpperCase()}] [${module}] ${message}`
}

export function createLogger(module: string) {
  return {
    debug(message: string, data?: unknown) {
      if (shouldLog('debug')) {
        console.debug(formatMessage('debug', module, message), data ?? '')
      }
    },
    info(message: string, data?: unknown) {
      if (shouldLog('info')) {
        console.info(formatMessage('info', module, message), data ?? '')
      }
    },
    warn(message: string, data?: unknown) {
      if (shouldLog('warn')) {
        console.warn(formatMessage('warn', module, message), data ?? '')
      }
    },
    error(message: string, data?: unknown) {
      if (shouldLog('error')) {
        console.error(formatMessage('error', module, message), data ?? '')
      }
      // Forward errors to Sentry when configured
      if (import.meta.env.VITE_SENTRY_DSN) {
        if (data instanceof Error) {
          Sentry.captureException(data, { extra: { module, message } })
        } else {
          Sentry.captureMessage(message, { level: 'error', extra: { module, data } })
        }
      }
    },
  }
}

export const logger = createLogger('app')
