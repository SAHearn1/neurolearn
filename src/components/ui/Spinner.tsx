interface SpinnerProps {
  label?: string
}

export function Spinner({ label = 'Loading' }: SpinnerProps) {
  return (
    <span
      aria-label={label}
      className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600"
      role="status"
    />
  )
}
