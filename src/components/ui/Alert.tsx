import type { HTMLAttributes, ReactNode } from 'react'

type AlertVariant = 'info' | 'success' | 'warning' | 'error'

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: AlertVariant
}

const variantClasses: Record<AlertVariant, string> = {
  info: 'border-brand-200 bg-brand-50 text-brand-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  error: 'border-rose-200 bg-rose-50 text-rose-700',
}

export function Alert({ children, className = '', variant = 'info', ...props }: AlertProps) {
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${variantClasses[variant]} ${className}`.trim()} role="alert" {...props}>
      {children}
    </div>
  )
}
