import type { CourseLevel } from '../../types/course'

interface GradientThumbnailProps {
  level: CourseLevel
  icon?: string
  className?: string
}

const LEVEL_CONFIG: Record<CourseLevel, { gradient: string; emoji: string }> = {
  beginner: { gradient: 'bg-grad-beginner', emoji: '🌱' },
  intermediate: { gradient: 'bg-grad-intermediate', emoji: '🔥' },
  advanced: { gradient: 'bg-grad-advanced', emoji: '⚡' },
}

export function GradientThumbnail({ level, icon, className = '' }: GradientThumbnailProps) {
  const { gradient, emoji } = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.beginner

  return (
    <div
      aria-hidden="true"
      className={`flex h-28 items-center justify-center rounded-t-xl ${gradient} ${className}`}
    >
      <span className="text-4xl">{icon ?? emoji}</span>
    </div>
  )
}
