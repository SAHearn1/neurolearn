import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { getSupabaseClient, hasSupabaseEnv } from '../../utils/supabase/client'

export function useAuth() {
  const { isAuthenticated, setAuthenticated, setUserId, userId } = useAuthStore()
  const [authError, setAuthError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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

  function clearError() {
    setAuthError(null)
  }

  async function signIn(email: string, password: string) {
    if (!hasSupabaseEnv) {
      setAuthError('Authentication is not configured yet. Add Supabase environment variables to continue.')
      return false
    }

    const supabase = getSupabaseClient()
    if (!supabase) {
      setAuthError('Authentication client is unavailable.')
      return false
    }

    setIsLoading(true)
    setAuthError(null)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setIsLoading(false)

    if (error) {
      setAuthError(error.message)
      return false
    }

    const sessionUserId = data.user?.id ?? null
    setUserId(sessionUserId)
    setAuthenticated(Boolean(sessionUserId))
    return true
  }

  async function signUp(email: string, password: string) {
    if (!hasSupabaseEnv) {
      setAuthError('Sign-up is not configured yet. Add Supabase environment variables to continue.')
      return false
    }

    const supabase = getSupabaseClient()
    if (!supabase) {
      setAuthError('Authentication client is unavailable.')
      return false
    }

    setIsLoading(true)
    setAuthError(null)

    const { data, error } = await supabase.auth.signUp({ email, password })
    setIsLoading(false)

    if (error) {
      setAuthError(error.message)
      return false
    }

    const sessionUserId = data.user?.id ?? null
    setUserId(sessionUserId)
    setAuthenticated(Boolean(sessionUserId))
    return true
  }

  async function signOut() {
    const supabase = getSupabaseClient()
    if (supabase) {
      await supabase.auth.signOut()
    }

    setUserId(null)
    setAuthenticated(false)
  }

  return { authError, clearError, isAuthenticated, isLoading, signIn, signOut, signUp, userId }
}
