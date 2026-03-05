interface StreakBadgeProps {
  days: number
}

export function StreakBadge({ days }: StreakBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-grad-streak px-4 py-2 text-sm font-bold text-white shadow-sm">
      <span className="animate-streak">🔥</span>
      {days}-day streak
    </span>
  )
}
