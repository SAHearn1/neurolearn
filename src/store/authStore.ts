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
  signIn: (email: string, password: string) => Promise<void>
  /** Returns the active Session when the user is immediately confirmed,
   *  or null when email confirmation is pending. */
  signUp: (email: string, password: string, displayName: string, role?: string) => Promise<Session | null>
  signOut: () => Promise<void>
  initialize: () => () => void
}

async function loadRole(userId: string): Promise<UserRole | null> {
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', userId)
    .single()
  return data ? (data.role as UserRole) : null
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  role: null,
  loading: false,
  initialized: false,

  signIn: async (email, password) => {
    set({ loading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      const role = data.user ? await loadRole(data.user.id) : null
      set({ user: data.user, session: data.session, role })
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
      set({ user: data.user, session: data.session })
      // When email confirmation is enabled, data.session is null.
      if (data.session && data.user) {
        const userRole = await loadRole(data.user.id)
        set({ role: userRole })
      }
      return data.session
    } finally {
      set({ loading: false })
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null, role: null })
  },

  initialize: () => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const role = session?.user ? await loadRole(session.user.id) : null
      set({ user: session?.user ?? null, session, role, initialized: true })
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Role is intentionally NOT re-fetched here to avoid redundant queries
      // on every token refresh. It is fetched once in initialize() and signIn().
      set({ user: session?.user ?? null, session })
      if (!session) set({ role: null })
    })

    return () => subscription.unsubscribe()
  },
}))
