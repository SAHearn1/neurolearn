import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { getSupabaseClient } from '../../utils/supabase/client'

export function useAuth() {
  const { isAuthenticated, setAuthenticated, setUserId, userId } = useAuthStore()

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      const sessionUserId = data.session?.user?.id ?? null
      setUserId(sessionUserId)
      setAuthenticated(Boolean(sessionUserId))
    })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUserId = session?.user?.id ?? null
      setUserId(sessionUserId)
      setAuthenticated(Boolean(sessionUserId))
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [setAuthenticated, setUserId])

  async function signIn(email: string, password: string) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return
    }

    const { data } = await supabase.auth.signInWithPassword({ email, password })
    const sessionUserId = data.user?.id ?? null
    setUserId(sessionUserId)
    setAuthenticated(Boolean(sessionUserId))
  }

  async function signUp(email: string, password: string) {
    const supabase = getSupabaseClient()
    if (!supabase) {
      return
    }

    const { data } = await supabase.auth.signUp({ email, password })
    const sessionUserId = data.user?.id ?? null
    setUserId(sessionUserId)
    setAuthenticated(Boolean(sessionUserId))
  }

  async function signOut() {
    const supabase = getSupabaseClient()
    if (supabase) {
      await supabase.auth.signOut()
    }

    setUserId(null)
    setAuthenticated(false)
  }

  return { isAuthenticated, signIn, signOut, signUp, userId }
}
