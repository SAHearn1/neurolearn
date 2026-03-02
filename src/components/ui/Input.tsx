import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Input({ className = '', id, label, ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <label className="block text-sm font-medium text-slate-700" htmlFor={inputId}>
      {label}
      <input
        className={`mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring ${className}`.trim()}
        id={inputId}
        {...props}
      />
    </label>
  )
}
