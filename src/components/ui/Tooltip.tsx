import type { ReactNode } from 'react'

interface TooltipProps {
  children: ReactNode
  text: string
}

export function Tooltip({ children, text }: TooltipProps) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded bg-slate-900 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
        {text}
      </span>
    </span>
  )
}
