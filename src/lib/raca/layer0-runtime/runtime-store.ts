import { create } from 'zustand'
import { runtimeReducer, INITIAL_RUNTIME_STATE } from './runtime-reducer'
import type { RuntimeState, RuntimeAction } from './runtime-reducer'

/**
 * Layer 0 Runtime Store — Zustand store wrapping the runtime reducer.
 * Provides `dispatch()` as the sole mutation pathway.
 */

interface RuntimeStore extends RuntimeState {
  dispatch: (action: RuntimeAction) => void
}

export const useRuntimeStore = create<RuntimeStore>((set) => ({
  ...INITIAL_RUNTIME_STATE,

  dispatch: (action) =>
    set((state) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { dispatch: _, ...currentState } = state
      const next = runtimeReducer(currentState, action)
      return next
    }),
}))
