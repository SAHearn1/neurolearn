import { Link } from 'react-router-dom'
import type { SpacedRepetitionItem } from '../../lib/intelligence/spaced-repetition'

interface SpacedRepetitionCardProps {
  dueItems: (SpacedRepetitionItem & { id: string })[]
}

const MAX_VISIBLE = 3

/**
 * ASS-02: Spaced Repetition Card
 * Displays due review items on the dashboard.
 */
export function SpacedRepetitionCard({ dueItems }: SpacedRepetitionCardProps) {
  if (dueItems.length === 0) return null

  const visible = dueItems.slice(0, MAX_VISIBLE)
  const remaining = dueItems.length - MAX_VISIBLE

  return (
    <div
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      aria-label={`${dueItems.length} lessons due for review`}
    >
      <h3 className="mb-3 text-sm font-semibold text-slate-800">
        📅 Due for review ({dueItems.length})
      </h3>

      <ul className="space-y-2">
        {visible.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-2 text-sm text-slate-700"
          >
            <span className="truncate">{item.skillCode ?? item.lessonId}</span>
            {item.courseId != null ? (
              <Link
                to={`/courses/${item.courseId}/lessons/${item.lessonId}/session`}
                aria-label={`Review ${item.skillCode ?? item.lessonId}`}
                className="shrink-0 text-xs font-medium text-brand-600 hover:text-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
              >
                Review now →
              </Link>
            ) : (
              <span
                className="shrink-0 text-xs font-medium text-slate-400 cursor-not-allowed"
                aria-label={`Review ${item.skillCode ?? item.lessonId} (no course linked)`}
              >
                Review now →
              </span>
            )}
          </li>
        ))}
      </ul>

      {remaining > 0 && (
        <div className="mt-3 border-t border-slate-100 pt-2">
          <Link
            to="/courses"
            className="text-xs font-medium text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
          >
            See all ({remaining} more) →
          </Link>
        </div>
      )}
    </div>
  )
}
