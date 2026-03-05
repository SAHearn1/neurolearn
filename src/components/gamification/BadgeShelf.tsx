import { totalXP, LEVELS } from '../../lib/xp'

/**
 * Badge definitions — tied to observable learner behaviors, not AI output.
 * Future badges will reward TRACE cycle completions and revision depth
 * (once RACA session artifacts are surfaced to the profile).
 */
interface BadgeDef {
  id: string
  emoji: string
  title: string
  description: string
  earned: boolean
  category: 'journey' | 'streak' | 'depth' | 'mastery'
}

function buildBadges(lessonsCompleted: number, streakDays: number): BadgeDef[] {
  const xp = totalXP(lessonsCompleted, streakDays)
  return [
    {
      id: 'first-step',
      emoji: '🌱',
      title: 'First Step',
      description: 'Complete your first lesson',
      earned: lessonsCompleted >= 1,
      category: 'journey',
    },
    {
      id: 'on-fire',
      emoji: '🔥',
      title: 'On Fire',
      description: '3-day learning streak',
      earned: streakDays >= 3,
      category: 'streak',
    },
    {
      id: 'week-warrior',
      emoji: '⚡',
      title: 'Week Warrior',
      description: '7 days in a row',
      earned: streakDays >= 7,
      category: 'streak',
    },
    {
      id: 'bookworm',
      emoji: '📚',
      title: 'Bookworm',
      description: 'Complete 10 lessons',
      earned: lessonsCompleted >= 10,
      category: 'journey',
    },
    {
      id: 'deep-thinker',
      emoji: '🧠',
      title: 'Deep Thinker',
      description: 'Complete 25 lessons',
      earned: lessonsCompleted >= 25,
      category: 'depth',
    },
    {
      id: 'scholar',
      emoji: '🎓',
      title: 'Scholar',
      description: 'Complete 50 lessons',
      earned: lessonsCompleted >= 50,
      category: 'mastery',
    },
    {
      id: 'fire-keeper',
      emoji: '🏆',
      title: 'Champion',
      description: '30-day learning streak',
      earned: streakDays >= 30,
      category: 'streak',
    },
    {
      id: 'centurion',
      emoji: '💯',
      title: 'Centurion',
      description: 'Complete 100 lessons',
      earned: lessonsCompleted >= 100,
      category: 'mastery',
    },
    {
      id: 'legend',
      emoji: '🚀',
      title: 'Legend',
      description: 'Reach Level 6',
      earned: xp >= LEVELS[5].minXp,
      category: 'mastery',
    },
  ]
}

interface BadgeShelfProps {
  lessonsCompleted: number
  streakDays: number
}

export function BadgeShelf({ lessonsCompleted, streakDays }: BadgeShelfProps) {
  const badges = buildBadges(lessonsCompleted, streakDays)
  const earned = badges.filter((b) => b.earned)
  const locked = badges.filter((b) => !b.earned)
  const all = [...earned, ...locked]

  return (
    <section aria-label="Achievements">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Achievements</h2>
          <p className="text-sm text-slate-500">
            {earned.length} of {all.length} earned
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700 ring-1 ring-brand-200">
          {earned.length}
        </div>
      </div>

      <div
        className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="list"
        aria-label="Badge list"
      >
        {all.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}
      </div>

      {earned.length === 0 && (
        <p className="mt-2 text-center text-sm text-slate-400">
          Complete your first lesson to earn your first badge!
        </p>
      )}
    </section>
  )
}

function BadgeCard({ badge }: { badge: BadgeDef }) {
  return (
    <div
      role="listitem"
      aria-label={`${badge.title}${badge.earned ? ' — earned' : ' — locked'}`}
      title={badge.description}
      className={`relative flex flex-shrink-0 flex-col items-center gap-2 rounded-2xl px-3 py-4 text-center transition-all duration-200 ${
        badge.earned
          ? 'bg-white shadow-card ring-1 ring-slate-200 hover:shadow-card-hover hover:-translate-y-0.5'
          : 'bg-slate-100/80 opacity-50'
      }`}
      style={{ minWidth: '84px' }}
    >
      <span
        className={`text-3xl leading-none ${badge.earned ? '' : 'grayscale'}`}
        aria-hidden="true"
      >
        {badge.emoji}
      </span>
      <p
        className={`text-xs font-bold leading-tight ${badge.earned ? 'text-slate-800' : 'text-slate-400'}`}
      >
        {badge.title}
      </p>
      {badge.earned && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white shadow-sm">
          ✓
        </span>
      )}
      {!badge.earned && (
        <span className="text-lg leading-none text-slate-300" aria-hidden="true">
          🔒
        </span>
      )}
    </div>
  )
}
