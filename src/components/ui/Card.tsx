import type { HTMLAttributes, ReactNode } from 'react'

type CardVariant = 'default' | 'elevated' | 'flush'

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  variant?: CardVariant
}

const variantClasses: Record<CardVariant, string> = {
  default: 'border border-slate-200 bg-white p-5 shadow-card',
  elevated: 'bg-white p-5 shadow-[0_8px_30px_-4px_rgba(15,23,42,0.10)] ring-1 ring-slate-900/5',
  flush: 'bg-white',
}

export function Card({ children, className = '', variant = 'default', ...props }: CardProps) {
  return (
    <section className={`rounded-xl ${variantClasses[variant]} ${className}`.trim()} {...props}>
      {children}
    </section>
  )
}
