import { supabase } from '../../../../utils/supabase/client'
import { useRuntimeStore } from './runtime-store'
import type { RuntimeState } from './runtime-reducer'

/**
 * Session Persistence — save/restore session state to Supabase.
 * Uses the cognitive_sessions table for durable storage.
 */

const STORAGE_KEY = 'neurolearn.raca.session'

/** Save current runtime state to localStorage (immediate) */
export function saveSessionLocal(): void {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { dispatch, ...state } = useRuntimeStore.getState()
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage may be full or unavailable
  }
}

/** Restore session from localStorage */
export function restoreSessionLocal(): RuntimeState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as RuntimeState
  } catch {
    return null
  }
}

/** Clear local session storage */
export function clearSessionLocal(): void {
  localStorage.removeItem(STORAGE_KEY)
}

/** Persist session state to Supabase */
export async function saveSessionRemote(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { dispatch, ...state } = useRuntimeStore.getState()
  if (!state.session_id || !state.user_id) return

  const { error } = await supabase.from('cognitive_sessions').upsert(
    {
      id: state.session_id,
      user_id: state.user_id,
      lesson_id: state.lesson_id,
      course_id: state.course_id,
      status: state.status,
      current_state: state.current_state,
      state_history: state.state_history,
      regulation: state.regulation,
      started_at: state.started_at,
      updated_at: state.updated_at,
    },
    { onConflict: 'id' },
  )

  if (error) {
    console.error('[RACA Persistence] Remote save failed:', error.message)
    throw error
  }
}

/** Restore session from Supabase */
export async function restoreSessionRemote(sessionId: string): Promise<RuntimeState | null> {
  const { data, error } = await supabase
    .from('cognitive_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error || !data) return null

  // Fetch artifacts for this session
  const { data: artifactRows } = await supabase
    .from('raca_artifacts')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  return {
    session_id: data.id,
    user_id: data.user_id,
    lesson_id: data.lesson_id,
    course_id: data.course_id,
    status: data.status,
    current_state: data.current_state,
    state_history: data.state_history ?? ['ROOT'],
    regulation: data.regulation ?? {
      level: 75,
      signals: [],
      intervention_active: false,
      intervention_count: 0,
      last_check: '',
    },
    artifacts: (artifactRows ?? []).map((row) => ({
      id: row.id,
      session_id: row.session_id,
      kind: row.kind,
      state: row.state,
      content: row.content,
      word_count: row.word_count,
      version: row.version,
      created_at: row.created_at,
    })),
    events: [],
    epistemic_snapshots: [],
    started_at: data.started_at,
    updated_at: data.updated_at,
  }
}
