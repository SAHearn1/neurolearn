import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { useRuntimeStore } from '../lib/raca/layer0-runtime/runtime-store'
import { SessionPage } from './SessionPage'

// Mock the RACA feature flags — runtime disabled by default
vi.mock('../lib/raca/feature-flags', () => ({
  racaFlags: {
    runtime: false,
    cognitiveFsm: false,
    agentRouter: false,
    agents: false,
    epistemicMonitoring: false,
    guardrails: false,
    auditPersistence: false,
    adaptation: false,
  },
}))

// Mock persistence to prevent localStorage access
vi.mock('../lib/raca/layer0-runtime/persistence', () => ({
  saveSessionLocal: vi.fn(),
  saveSessionRemote: vi.fn().mockResolvedValue(undefined),
  clearSessionLocal: vi.fn(),
  restoreSessionLocal: vi.fn().mockReturnValue(null),
}))

// Mock audit trail
vi.mock('../lib/raca/layer0-runtime/audit-trail', () => ({
  flushAuditBuffer: vi.fn().mockResolvedValue(undefined),
  stopAuditFlush: vi.fn(),
}))

function renderSessionPage(courseId = 'course-1', lessonId = 'lesson-1') {
  return render(
    <MemoryRouter initialEntries={[`/courses/${courseId}/lessons/${lessonId}/session`]}>
      <Routes>
        <Route path="/courses/:courseId/lessons/:lessonId/session" element={<SessionPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  useRuntimeStore.setState({
    session_id: null,
    user_id: null,
    lesson_id: null,
    course_id: null,
    status: null,
    current_state: 'ROOT',
    state_history: [],
    regulation: {
      level: 50,
      signals: [],
      intervention_active: false,
      intervention_count: 0,
      last_check: '',
    },
    artifacts: [],
    events: [],
  })
})

describe('SessionPage', () => {
  it('shows RACA disabled message when runtime flag is off', () => {
    renderSessionPage()
    expect(screen.getByText(/RACA sessions are not enabled/i)).toBeInTheDocument()
  })

  it('renders a back-to-lesson link when runtime is disabled', () => {
    renderSessionPage('course-1', 'lesson-1')
    expect(screen.getByRole('link', { name: /back to lesson/i })).toBeInTheDocument()
  })
})
