import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const store = useAuthStore()

  useEffect(() => {
    const unsubscribe = store.initialize()
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    user: store.user,
    session: store.session,
    loading: store.loading,
    initialized: store.initialized,
    isAuthenticated: !!store.session,
    signIn: store.signIn,
    signUp: store.signUp,
    signOut: store.signOut,
  }
}
