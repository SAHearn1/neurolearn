import { totalXP, LEVELS } from '../../lib/xp'

/**
 * Badge definitions — tied to observable learner behaviors, not AI output.
 * Includes session-based RACA badges (REQ-18-01) and deep-work streak badges (REQ-18-08).
 */
interface BadgeDef {
  id: string
  emoji: string
  title: string
  description: string
  earned: boolean
  category: 'journey' | 'streak' | 'depth' | 'mastery'
}

interface SessionBadgeData {
  totalRacaSessions: number
  reviseSessions: number
  defendSessions: number
  hasDeepThinkerSession: boolean
  deepWorkStreakDays: number
}

function buildBadges(
  lessonsCompleted: number,
  streakDays: number,
  session: SessionBadgeData = {
    totalRacaSessions: 0,
    reviseSessions: 0,
    defendSessions: 0,
    hasDeepThinkerSession: false,
    deepWorkStreakDays: 0,
  },
): BadgeDef[] {
  const xp = totalXP(lessonsCompleted, streakDays)
  return [
    // ── Journey ─────────────────────────────────────────────────────
    {
      id: 'first-step',
      emoji: '🌱',
      title: 'First Step',
      description: 'Complete your first lesson',
      earned: lessonsCompleted >= 1,
      category: 'journey',
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
      id: 'scholar',
      emoji: '🎓',
      title: 'Scholar',
      description: 'Complete 50 lessons',
      earned: lessonsCompleted >= 50,
      category: 'mastery',
    },
    {
      id: 'centurion',
      emoji: '💯',
      title: 'Centurion',
      description: 'Complete 100 lessons',
      earned: lessonsCompleted >= 100,
      category: 'mastery',
    },
    // ── Lesson streak ────────────────────────────────────────────────
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
      id: 'fire-keeper',
      emoji: '🏆',
      title: 'Champion',
      description: '30-day learning streak',
      earned: streakDays >= 30,
      category: 'streak',
    },
    // ── Deep work streak — REQ-18-08 ─────────────────────────────────
    {
      id: 'first-deep-day',
      emoji: '🧠',
      title: 'First Deep Day',
      description: 'Complete any RACA deep learning session',
      earned: session.totalRacaSessions >= 1,
      category: 'depth',
    },
    {
      id: 'deep-streak-3',
      emoji: '🌊',
      title: '3-Day Deep Streak',
      description: '3 consecutive days with deep work sessions',
      earned: session.deepWorkStreakDays >= 3,
      category: 'depth',
    },
    {
      id: 'deep-streak-7',
      emoji: '🌟',
      title: 'Week of Deep Work',
      description: '7 consecutive days with deep work sessions',
      earned: session.deepWorkStreakDays >= 7,
      category: 'depth',
    },
    // ── RACA session depth — REQ-18-01 ───────────────────────────────
    {
      id: 'revisionist',
      emoji: '✍️',
      title: 'Revisionist',
      description: 'Revise your work in 3 sessions',
      earned: session.reviseSessions >= 3,
      category: 'depth',
    },
    {
      id: 'defender',
      emoji: '⚔️',
      title: 'Defender',
      description: 'Complete the DEFEND state 5 times',
      earned: session.defendSessions >= 5,
      category: 'depth',
    },
    {
      id: 'deep-thinker-trace',
      emoji: '💡',
      title: 'Deep Thinker',
      description: 'Achieve a TRACE score of 7 or above in a session',
      earned: session.hasDeepThinkerSession,
      category: 'depth',
    },
    // ── Mastery ──────────────────────────────────────────────────────
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
  session?: SessionBadgeData
}

export function BadgeShelf({ lessonsCompleted, streakDays, session }: BadgeShelfProps) {
  const badges = buildBadges(lessonsCompleted, streakDays, session)
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
