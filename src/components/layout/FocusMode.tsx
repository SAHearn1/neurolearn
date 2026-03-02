import type { ReactNode } from 'react'

interface FocusModeProps {
  children: ReactNode
  enabled?: boolean
}

export function FocusMode({ children, enabled = false }: FocusModeProps) {
  if (!enabled) {
    return <>{children}</>
  }

  return (
    <div className="mx-auto w-full max-w-3xl rounded-xl border border-brand-300 bg-white/95 p-4 shadow-sm">
      {children}
    </div>
  )
}
