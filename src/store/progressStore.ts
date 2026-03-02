import { create } from 'zustand'
import type { Progress } from '../types'

interface ProgressState {
  items: Progress[]
  setItems: (items: Progress[]) => void
}

export const useProgressStore = create<ProgressState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}))
