import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const { isAuthenticated, setAuthenticated, setUserId, userId } = useAuthStore()

  function signIn(nextUserId: string) {
    setUserId(nextUserId)
    setAuthenticated(true)
  }

  function signOut() {
    setUserId(null)
    setAuthenticated(false)
  }

  return { isAuthenticated, signIn, signOut, userId }
}
