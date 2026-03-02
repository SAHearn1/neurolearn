interface ProgressBarProps {
  label?: string
  value: number
}

export function ProgressBar({ label, value }: ProgressBarProps) {
  const boundedValue = Math.max(0, Math.min(100, value))

  return (
    <div>
      {label ? <p className="mb-1 text-sm text-slate-600">{label}</p> : null}
      <div aria-valuemax={100} aria-valuemin={0} aria-valuenow={boundedValue} className="h-2 rounded-full bg-slate-100" role="progressbar">
        <div className="h-2 rounded-full bg-brand-500" style={{ width: `${boundedValue}%` }} />
      </div>
    </div>
  )
}
