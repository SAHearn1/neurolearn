import { create } from 'zustand'

interface AuthState {
  isAuthenticated: boolean
  setAuthenticated: (value: boolean) => void
  userId: string | null
  setUserId: (value: string | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setUserId: (value) => set({ userId: value }),
  userId: null,
}))
