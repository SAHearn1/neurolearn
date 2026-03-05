interface ProgressRingProps {
  value: number
  size?: number
  label?: string
}

export function ProgressRing({ value, size = 64, label }: ProgressRingProps) {
  const bounded = Math.max(0, Math.min(100, value))
  const radius = 14
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (bounded / 100) * circumference

  return (
    <div
      aria-label={label ?? `${bounded}% complete`}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={bounded}
      className="relative inline-flex items-center justify-center"
      role="progressbar"
      style={{ width: size, height: size }}
    >
      <svg
        className="-rotate-90"
        fill="none"
        height={size}
        viewBox="0 0 36 36"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Track */}
        <circle
          className="stroke-slate-200"
          cx="18"
          cy="18"
          fill="none"
          r={radius}
          strokeWidth="3"
        />
        {/* Progress */}
        <circle
          className="stroke-brand-500 transition-all duration-500"
          cx="18"
          cy="18"
          fill="none"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth="3"
        />
      </svg>
      <span className="absolute text-xs font-bold text-slate-700">{bounded}%</span>
    </div>
  )
}
