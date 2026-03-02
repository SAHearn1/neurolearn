import { Badge } from '../ui/Badge'

interface StreakBadgeProps {
  days: number
}

export function StreakBadge({ days }: StreakBadgeProps) {
  return <Badge>{days}-day streak 🔥</Badge>
}
