import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500',
  secondary:
    'border border-slate-300 bg-white text-slate-700 hover:border-brand-300 hover:text-brand-700 focus-visible:ring-brand-500',
  ghost: 'bg-transparent text-brand-700 hover:bg-brand-50 focus-visible:ring-brand-500',
}

export function Button({ children, className = '', type = 'button', variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring ${variantClasses[variant]} ${className}`.trim()}
      type={type}
      {...props}
    >
      {children}
    </button>
  )
}
