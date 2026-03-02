import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import { App } from './App'
import './styles/index.css'

// Initialize Sentry — only when DSN is configured
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT ?? 'development',
    enabled: import.meta.env.VITE_SENTRY_ENVIRONMENT === 'production',
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: false,
      }),
    ],
    tracesSampleRate: import.meta.env.VITE_SENTRY_ENVIRONMENT === 'production' ? 0.1 : 0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  })
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found. Make sure index.html contains <div id="root">.')
}

createRoot(rootElement).render(
  <StrictMode>
    <Sentry.ErrorBoundary
      fallback={({ error }) => (
        <div role="alert" style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p>We&apos;ve been notified and are looking into it.</p>
          <pre style={{ fontSize: '0.875rem', color: '#666' }}>
            {error instanceof Error ? error.message : 'Unknown error'}
          </pre>
          <button onClick={() => window.location.reload()}>Reload page</button>
        </div>
      )}
    >
      <BrowserRouter>
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <App />
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
