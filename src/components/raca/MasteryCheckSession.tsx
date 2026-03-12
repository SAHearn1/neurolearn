import { useState } from 'react'
import { supabase } from '../../../utils/supabase/client'
import { useAuthStore } from '../../store/authStore'
import { useMasteryScoring } from '../../hooks/useMasteryScoring'

interface MasteryCheckSessionProps {
  courseId: string
  lessonId: string
  onComplete: (passed: boolean) => void
}

/**
 * ASS-01: Mastery Check Session
 * A simplified session wrapper for mastery check mode.
 * Skips full RACA flow and goes straight to a DEFEND-style prompt.
 */
export function MasteryCheckSession({ courseId, lessonId, onComplete }: MasteryCheckSessionProps) {
  const user = useAuthStore((s) => s.user)
  const { archiveSession } = useMasteryScoring()
  const [response, setResponse] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<'passed' | 'failed' | null>(null)

  const wordCount = response.trim().split(/\s+/).filter(Boolean).length

  const handleSubmit = async () => {
    if (wordCount < 10 || submitting) return

    setSubmitting(true)
    try {
      const masteryResult = await archiveSession({
        sessionId: '',
        lessonId,
        courseId,
        statesCompleted: ['DEFEND'],
        artifactText: response,
        sessionDurationMs: 0,
      })

      const passed = masteryResult.masteryScore >= 0.7
      setResult(passed ? 'passed' : 'failed')

      // Write cooldown row on failure (24 hour cooldown)
      if (!passed && user?.id) {
        const cooldownUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        await supabase
          .from('mastery_cooldowns')
          .upsert({
            user_id: user.id,
            lesson_id: lessonId,
            attempt_at: new Date().toISOString(),
            cooldown_until: cooldownUntil,
          })
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId)
      }

      onComplete(passed)
    } catch {
      // Allow retry on error
      setSubmitting(false)
    }
  }

  if (result === 'passed') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border border-green-200 bg-green-50 p-6 text-center"
      >
        <p className="text-lg font-semibold text-green-800">Mastery confirmed! 🎉</p>
        <p className="mt-1 text-sm text-green-700">
          You demonstrated solid understanding of this material.
        </p>
      </div>
    )
  }

  if (result === 'failed') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center"
      >
        <p className="text-lg font-semibold text-amber-800">Not quite yet — keep practicing</p>
        <p className="mt-1 text-sm text-amber-700">
          Come back in 24 hours and try again after more practice.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-brand-200 bg-brand-50 p-4">
        <p className="text-sm font-semibold text-brand-800">
          Prove you know this — explain it without notes
        </p>
        <p className="mt-1 text-xs text-brand-600">
          Write a clear explanation in your own words. Show your reasoning.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="mastery-response" className="block text-sm font-medium text-slate-700">
          Your explanation
        </label>
        <textarea
          id="mastery-response"
          aria-label="Write your mastery explanation here"
          className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          rows={8}
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Explain the concept as if you were teaching it to someone else..."
          disabled={submitting}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">{wordCount} words</span>
          <button
            type="button"
            aria-label="Submit mastery check response"
            onClick={handleSubmit}
            disabled={wordCount < 10 || submitting}
            className="rounded-lg border border-transparent bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Evaluating…' : 'Submit response'}
          </button>
        </div>
      </div>
    </div>
  )
}
