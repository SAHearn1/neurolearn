import { useEffect, useState, useCallback } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

export type MilestoneType =
  | 'first-lesson'
  | 'streak-3'
  | 'streak-7'
  | 'streak-30'
  | 'course-complete'
  | 'lessons-10'
  | 'lessons-50'
  | 'lessons-100'

interface Milestone {
  type: MilestoneType
  title: string
  description: string
  icon: string
}

const MILESTONES: Record<MilestoneType, Omit<Milestone, 'type'>> = {
  'first-lesson': {
    title: 'First Steps!',
    description: 'You completed your first lesson. The journey begins!',
    icon: '🌱',
  },
  'streak-3': {
    title: '3-Day Streak!',
    description: 'Three days of consistent learning. Keep it up!',
    icon: '🔥',
  },
  'streak-7': {
    title: 'Week Warrior!',
    description: 'A full week of daily learning. Incredible commitment!',
    icon: '⭐',
  },
  'streak-30': {
    title: 'Monthly Master!',
    description: '30 days straight! Your dedication is inspiring.',
    icon: '🏆',
  },
  'course-complete': {
    title: 'Course Complete!',
    description: 'You finished an entire course. Time to celebrate!',
    icon: '🎓',
  },
  'lessons-10': {
    title: '10 Lessons!',
    description: 'Double digits! Your knowledge is growing.',
    icon: '📚',
  },
  'lessons-50': {
    title: '50 Lessons!',
    description: 'Half a century of lessons completed!',
    icon: '🚀',
  },
  'lessons-100': {
    title: 'Century Club!',
    description: '100 lessons! You are a true learner.',
    icon: '💯',
  },
}

interface MilestoneCelebrationProps {
  milestone: MilestoneType
  onDismiss: () => void
}

export function MilestoneCelebration({ milestone, onDismiss }: MilestoneCelebrationProps) {
  const [visible, setVisible] = useState(false)
  const data = MILESTONES[milestone]

  // Respect reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = useCallback(() => {
    setVisible(false)
    setTimeout(onDismiss, prefersReducedMotion ? 0 : 300)
  }, [onDismiss, prefersReducedMotion])

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    const timer = setTimeout(handleDismiss, 8000)
    return () => clearTimeout(timer)
  }, [handleDismiss])

  const animationClass = prefersReducedMotion
    ? visible ? 'opacity-100' : 'opacity-0'
    : visible
      ? 'opacity-100 translate-y-0 scale-100'
      : 'opacity-0 translate-y-4 scale-95'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      role="dialog"
      aria-label={`Milestone: ${data.title}`}
    >
      <div
        className={`transition-all duration-300 ${animationClass}`}
      >
        <Card className="max-w-sm text-center shadow-xl border-2 border-brand-300 bg-white">
          <div className="text-5xl mb-3" aria-hidden="true">{data.icon}</div>
          <Badge>Milestone</Badge>
          <h2 className="mt-2 text-xl font-bold text-slate-900">{data.title}</h2>
          <p className="mt-1 text-slate-600">{data.description}</p>
          <Button className="mt-4" onClick={handleDismiss}>
            Continue Learning
          </Button>
        </Card>
      </div>
    </div>
  )
}

/**
 * Check if a milestone should be triggered based on current stats.
 */
export function checkMilestone(
  lessonsCompleted: number,
  streakDays: number,
  courseJustCompleted: boolean,
): MilestoneType | null {
  if (courseJustCompleted) return 'course-complete'
  if (lessonsCompleted === 1) return 'first-lesson'
  if (lessonsCompleted === 100) return 'lessons-100'
  if (lessonsCompleted === 50) return 'lessons-50'
  if (lessonsCompleted === 10) return 'lessons-10'
  if (streakDays === 30) return 'streak-30'
  if (streakDays === 7) return 'streak-7'
  if (streakDays === 3) return 'streak-3'
  return null
}
