import { useState } from 'react'
import { Button } from '../ui/Button'
import { useProfile } from '../../hooks/useProfile'
import type { LearningStyle } from '../../types/profile'

interface OnboardingModalProps {
  onComplete: () => void
}

const GOALS = [
  { id: 'grades', label: 'Improve my grades', emoji: '📈' },
  { id: 'understand', label: 'Actually understand, not just memorize', emoji: '🧠' },
  { id: 'confidence', label: 'Build confidence in school', emoji: '💪' },
  { id: 'skills', label: 'Develop real-world skills', emoji: '🔧' },
] as const

const LEARNING_STYLES: Array<{ value: LearningStyle; label: string; emoji: string; desc: string }> =
  [
    {
      value: 'visual',
      label: 'Visual',
      emoji: '👁️',
      desc: 'I learn best with diagrams, charts, and visuals',
    },
    {
      value: 'auditory',
      label: 'Auditory',
      emoji: '🎧',
      desc: 'I learn best by listening and discussing',
    },
    {
      value: 'kinesthetic',
      label: 'Kinesthetic',
      emoji: '✋',
      desc: 'I learn best by doing and building',
    },
    {
      value: 'reading',
      label: 'Reading',
      emoji: '📖',
      desc: 'I learn best by reading and writing',
    },
  ]

const TOTAL_STEPS = 4

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1)
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [selectedStyles, setSelectedStyles] = useState<LearningStyle[]>([])
  const [saving, setSaving] = useState(false)
  const { updateProfile } = useProfile()

  const toggleGoal = (id: string) =>
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : prev.length < 3 ? [...prev, id] : prev,
    )

  const toggleStyle = (s: LearningStyle) =>
    setSelectedStyles((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))

  const handleComplete = async () => {
    setSaving(true)
    try {
      if (selectedStyles.length > 0) {
        await updateProfile({ learning_styles: selectedStyles })
      }
    } finally {
      setSaving(false)
      onComplete()
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to NeuroLearn"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-t-2xl bg-slate-100">
          <div
            className="h-full rounded-t-2xl bg-gradient-to-r from-brand-500 to-purple-600 transition-all duration-500"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>

        <div className="p-8">
          <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Step {step} of {TOTAL_STEPS}
          </p>

          {/* Step 1 — Welcome */}
          {step === 1 && (
            <div className="text-center">
              <div className="mb-4 text-5xl">🌱</div>
              <h2 className="mb-3 text-2xl font-bold text-slate-900">Welcome to NeuroLearn</h2>
              <p className="mb-6 text-slate-600">
                A learning platform designed to work with your brain, not against it. Whether you
                have ADHD, dyslexia, or just learn differently — you belong here.
              </p>
              <p className="mb-8 text-sm text-slate-500">
                This takes about 60 seconds. We will personalize your experience before you start.
              </p>
              <Button onClick={() => setStep(2)} className="w-full">
                Let's go →
              </Button>
            </div>
          )}

          {/* Step 2 — Goals */}
          {step === 2 && (
            <div>
              <h2 className="mb-2 text-xl font-bold text-slate-900">What brings you here?</h2>
              <p className="mb-5 text-sm text-slate-500">Pick up to 3 that resonate with you.</p>
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map(({ id, label, emoji }) => {
                  const selected = selectedGoals.includes(id)
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleGoal(id)}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all ${
                        selected
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-2xl">{emoji}</span>
                      {label}
                    </button>
                  )
                })}
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Next →
                </Button>
              </div>
            </div>
          )}

          {/* Step 3 — Learning styles */}
          {step === 3 && (
            <div>
              <h2 className="mb-2 text-xl font-bold text-slate-900">How do you learn best?</h2>
              <p className="mb-5 text-sm text-slate-500">
                Select all that apply — we adapt to your mix.
              </p>
              <div className="space-y-3">
                {LEARNING_STYLES.map(({ value, label, emoji, desc }) => {
                  const selected = selectedStyles.includes(value)
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleStyle(value)}
                      className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                        selected
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="text-2xl">{emoji}</span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{label}</p>
                        <p className="text-xs text-slate-500">{desc}</p>
                      </div>
                      {selected && (
                        <span className="ml-auto text-brand-600">
                          <svg
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(4)} className="flex-1">
                  Next →
                </Button>
              </div>
            </div>
          )}

          {/* Step 4 — RACA intro */}
          {step === 4 && (
            <div>
              <h2 className="mb-2 text-xl font-bold text-slate-900">
                How your deep learning sessions work
              </h2>
              <p className="mb-4 text-sm text-slate-500">
                You think. The AI scaffolds. Your reasoning stays yours — always.
              </p>

              {/* 9-state learning path */}
              <div className="mb-4 rounded-xl border border-brand-100 bg-brand-50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-700">
                  Your learning path
                </p>
                <ol className="space-y-1 text-xs text-slate-700">
                  {[
                    'Ground yourself',
                    'Check in',
                    'Frame your question',
                    'Plan your approach',
                    'Build your draft',
                    'Revise and deepen',
                    'Defend your reasoning',
                    'Reconnect and reflect',
                    'Archive your learning',
                  ].map((label, i) => (
                    <li key={label} className="flex items-center gap-2">
                      <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-brand-200 text-[10px] font-bold text-brand-800">
                        {i + 1}
                      </span>
                      {label}
                    </li>
                  ))}
                </ol>
                <p className="mt-2 text-xs text-slate-500 italic">
                  You move forward when you're ready — there's no timer.
                </p>
              </div>

              {/* AI helpers */}
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Your AI helpers
                </p>
                <p className="text-xs text-slate-600">
                  Specialist agents help you think at each stage — they ask you questions and
                  challenge your ideas. None of them will do the work for you. That&apos;s the
                  design.
                </p>
                <p className="mt-2 text-xs text-slate-500 italic">
                  If you get stuck, you can always ask for a nudge — not an answer.
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <Button variant="secondary" onClick={() => setStep(3)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleComplete} disabled={saving} className="flex-1">
                  {saving ? 'Saving…' : "I'm ready — let's learn 🚀"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
