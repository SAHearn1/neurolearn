import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-brand hover:from-brand-700 hover:to-purple-700 hover:shadow-lg active:scale-[0.98] focus-visible:ring-brand-500',
  secondary:
    'border border-slate-200 bg-white text-slate-700 shadow-card hover:border-brand-300 hover:text-brand-700 hover:shadow-card-hover focus-visible:ring-brand-500',
  ghost: 'text-slate-600 hover:text-brand-700 hover:bg-brand-50 focus-visible:ring-brand-500',
  danger:
    'bg-red-600 text-white shadow-sm hover:bg-red-700 active:scale-[0.98] focus-visible:ring-red-500',
}

export function Button({
  children,
  className = '',
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${className}`.trim()}
      type={type}
      {...props}
    >
      {children}
    </button>
  )
}
