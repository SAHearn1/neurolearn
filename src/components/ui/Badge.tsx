import type { HTMLAttributes, ReactNode } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
}

export function Badge({ children, className = '', ...props }: BadgeProps) {
  return (
    <span className={`inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 ${className}`.trim()} {...props}>
      {children}
    </span>
  )
}
