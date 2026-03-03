import { create } from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../../utils/supabase/client'
import type { UserRole } from '../types/profile'

interface AuthState {
  user: User | null
  session: Session | null
  role: UserRole | null
  loading: boolean
  initialized: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string, role?: string) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => () => void
}

async function fetchUserRole(userId: string): Promise<UserRole> {
  const { data } = await supabase.from('profiles').select('role').eq('user_id', userId).single()
  return (data?.role as UserRole) ?? 'learner'
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      const role = data.user ? await fetchUserRole(data.user.id) : null
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
      const userRole = data.user ? await fetchUserRole(data.user.id) : null
      set({ user: data.user, session: data.session, role: userRole })
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
      const role = session?.user ? await fetchUserRole(session.user.id) : null
      set({ user: session?.user ?? null, session, role, initialized: true })
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const role = session?.user ? await fetchUserRole(session.user.id) : null
      set({ user: session?.user ?? null, session, role })
    })

    return () => subscription.unsubscribe()
  },
}))
