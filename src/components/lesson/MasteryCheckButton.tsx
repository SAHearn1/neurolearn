import { useNavigate } from 'react-router-dom'
import { useMasteryCheck } from '../../hooks/useMasteryCheck'

interface MasteryCheckButtonProps {
  courseId: string
  lessonId: string
  lessonTitle: string
}

/**
 * ASS-01: Mastery Check Button
 * Shown on locked lesson cards — lets learners prove mastery to unlock a lesson.
 * Respects cooldown state from mastery_cooldowns table.
 */
export function MasteryCheckButton({ courseId, lessonId, lessonTitle }: MasteryCheckButtonProps) {
  const navigate = useNavigate()
  const { canAttempt, cooldownUntil, loading } = useMasteryCheck(lessonId)

  const handleClick = () => {
    if (!canAttempt) return
    navigate(`/courses/${courseId}/lessons/${lessonId}/session?mode=mastery_check`)
  }

  const formattedDate = cooldownUntil
    ? cooldownUntil.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  if (loading) {
    return (
      <button
        type="button"
        disabled
        aria-label={`Loading mastery check for ${lessonTitle}`}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-400 disabled:cursor-not-allowed"
      >
        Loading…
      </button>
    )
  }

  if (!canAttempt && formattedDate) {
    return (
      <div className="space-y-1">
        <button
          type="button"
          disabled
          aria-label={`Mastery check for ${lessonTitle} — available again on ${formattedDate}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-400 disabled:cursor-not-allowed"
        >
          Try again {formattedDate}
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Prove mastery for ${lessonTitle}`}
      className="inline-flex items-center gap-1.5 rounded-lg border border-brand-300 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
    >
      Prove I know this 🎯
    </button>
  )
}
