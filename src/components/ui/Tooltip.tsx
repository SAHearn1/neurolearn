import { type ReactNode, useId } from 'react'

interface TooltipProps {
  children: ReactNode
  text: string
}

export function Tooltip({ children, text }: TooltipProps) {
  const id = useId()

  return (
    <span className="group relative inline-flex" tabIndex={0} aria-describedby={id}>
      {children}
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded bg-slate-900 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {text}
      </span>
    </span>
  )
}
