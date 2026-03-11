// CCSS-03: Skill Power-Ups component
// Grid of skill cards showing level, evidence count, and new badge

import { useSkillPowerUps } from '../../hooks/useSkillPowerUps'
import { Spinner } from '../ui/Spinner'

const LEVEL_LABELS = ['', 'Novice', 'Apprentice', 'Practitioner', 'Expert', 'Master']

function LevelIndicator({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Level ${level} of 5`} role="img">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`h-2 w-4 rounded-sm ${i < level ? 'bg-brand-500' : 'bg-slate-200'}`}
        />
      ))}
    </div>
  )
}

export function SkillPowerUps() {
  const { powerUps, loading } = useSkillPowerUps()

  if (loading) return <Spinner />

  if (powerUps.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
        <p className="text-sm text-slate-500">
          Complete learning sessions to unlock skill power-ups!
        </p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-4 text-base font-semibold text-slate-900">Skill Power-Ups</h2>
      <ul
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Skill power-up cards"
      >
        {powerUps.map((p) => (
          <li
            key={p.skillCode}
            aria-label={`${p.displayName}: level ${p.level}, demonstrated ${p.evidenceCount} times${p.isNew ? ', newly unlocked' : ''}`}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            {/* Header with NEW badge */}
            <div className="mb-2 flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-slate-800">{p.displayName}</p>
              {p.isNew && (
                <span className="shrink-0 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-700">
                  NEW
                </span>
              )}
            </div>

            {/* Level label */}
            <p className="mb-1.5 text-xs text-slate-500">
              {LEVEL_LABELS[p.level] ?? 'Level ' + p.level}
            </p>

            {/* Level bars */}
            <LevelIndicator level={p.level} />

            {/* Evidence count */}
            <p className="mt-2 text-xs text-slate-400">
              Demonstrated {p.evidenceCount} time{p.evidenceCount === 1 ? '' : 's'}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
