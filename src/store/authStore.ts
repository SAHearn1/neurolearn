import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../../utils/supabase/client'
import type { UserRole } from '../types/profile'

interface AuthState {
  user: User | null
  session: Session | null
  /** Role loaded from profiles table. Single source of truth — do not fetch elsewhere. */
  role: UserRole | null
  loading: boolean
  initialized: boolean
  pendingEmailConfirmation: boolean
  signIn: (email: string, password: string) => Promise<void>
  /** Returns the active Session when the user is immediately confirmed,
   *  or null when email confirmation is pending. */
  signUp: (
    email: string,
    password: string,
    displayName: string,
    role?: string,
  ) => Promise<Session | null>
  signOut: () => Promise<void>
  initialize: () => () => void
}

async function loadRole(userId: string): Promise<UserRole | null> {
  const { data } = await supabase.from('profiles').select('role').eq('user_id', userId).single()
  return data ? (data.role as UserRole) : null
}

// Module-level subscription — created once at import time so React StrictMode's
// double-invoke of effects does not produce competing Web Lock acquisitions.
// onAuthStateChange fires INITIAL_SESSION on registration, so no getSession()
// call is needed. A second call would race for the same Web Lock and produce
// the "Lock not released" warning in StrictMode.
supabase.auth.onAuthStateChange(async (_event, session) => {
  const currentState = useAuthStore.getState()
  const shouldHydrateRole =
    !!session?.user && (!currentState.role || currentState.user?.id !== session.user.id)

  const nextRole = shouldHydrateRole ? await loadRole(session.user.id) : currentState.role

  useAuthStore.setState({
    user: session?.user ?? null,
    session,
    role: session ? nextRole : null,
    initialized: true,
    pendingEmailConfirmation: false,
  })
})

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  role: null,
  loading: false,
  initialized: false,
  pendingEmailConfirmation: false,

  signIn: async (email, password) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      const role = data.user ? await loadRole(data.user.id) : null
      set({ user: data.user, session: data.session, role, pendingEmailConfirmation: false })
    } finally {
      set({ loading: false })
    }
  },

  signUp: async (email, password, displayName, role = 'learner') => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName, role } },
      })
      if (error) throw error
      set({
        user: data.session ? data.user : null,
        session: data.session,
        role: null,
        pendingEmailConfirmation: !data.session,
      })
      // When email confirmation is enabled, data.session is null.
      if (data.session && data.user) {
        const userRole = await loadRole(data.user.id)
        set({ role: userRole, pendingEmailConfirmation: false })
      }
      return data.session
    } finally {
      set({ loading: false })
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null, role: null, pendingEmailConfirmation: false })
  },

  // initialize() is a no-op: the module-level onAuthStateChange subscription
  // fires INITIAL_SESSION and sets all auth state. No getSession() call here
  // avoids competing for the Web Lock that causes StrictMode's lock warnings.
  initialize: () => () => {},
}))
