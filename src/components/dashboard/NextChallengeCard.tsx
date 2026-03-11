import { Link } from 'react-router-dom'
import type { LearnerGap } from '../../hooks/useGapAnalysis'

interface NextChallengeCardProps {
  gaps: LearnerGap[]
}

/**
 * NextChallengeCard — shows the highest-priority gap as a "Your next challenge" card.
 * AI-02: Gap Detection + Micro-Learning Prescription Engine.
 */
export function NextChallengeCard({ gaps }: NextChallengeCardProps) {
  // Gaps are sorted by priority descending; first element is highest priority
  const topGap = gaps[0] ?? null

  if (!topGap) {
    return (
      <div
        className="rounded-xl border border-green-200 bg-green-50 p-4 shadow-sm"
        aria-label="All caught up"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden="true">
            🎉
          </span>
          <div>
            <p className="font-semibold text-green-900">You're on track — keep it up!</p>
            <p className="mt-1 text-sm text-green-700">
              No gaps detected. Keep completing sessions to maintain momentum.
            </p>
            <Link
              to="/courses"
              className="mt-3 inline-block rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-label="Browse courses"
            >
              Browse courses
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const href = topGap.recommendedLessonId
    ? `/courses?lesson=${topGap.recommendedLessonId}`
    : '/courses'

  return (
    <div
      className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm"
      aria-label="Your next challenge"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden="true">
          🎯
        </span>
        <div className="flex-1">
          <p className="font-semibold text-amber-900">Your next challenge</p>
          <p className="mt-1 text-sm text-amber-800">{topGap.description}</p>
          <Link
            to={href}
            className="mt-3 inline-block rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
            aria-label={topGap.recommendedAction}
          >
            {topGap.recommendedAction}
          </Link>
        </div>
      </div>
    </div>
  )
}
