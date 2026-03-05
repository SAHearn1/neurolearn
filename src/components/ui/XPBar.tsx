import type { LevelStatus } from '../../lib/xp'

interface XPBarProps {
  levelStatus: LevelStatus
}

export function XPBar({ levelStatus }: XPBarProps) {
  const { current, next, xp, progressPct, xpToNext } = levelStatus

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xl shadow-inner"
            role="img"
            aria-label={current.title}
          >
            {current.emoji}
          </span>
          <div>
            <p className="font-bold leading-tight text-white">
              Level {current.level} · {current.title}
            </p>
            <p className="text-xs text-white/70">{xp.toLocaleString()} XP total</p>
          </div>
        </div>
        {next && (
          <p className="text-right text-xs text-white/70">
            {xpToNext} XP to
            <br />
            <span className="font-semibold text-white/90">{next.title}</span>
          </p>
        )}
        {!next && (
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white">
            MAX LEVEL
          </span>
        )}
      </div>

      <div
        className="h-3 w-full overflow-hidden rounded-full bg-white/20"
        role="progressbar"
        aria-valuenow={progressPct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={next ? `${progressPct}% toward ${next.title}` : 'Maximum level reached'}
      >
        <div
          className="h-full rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all duration-700"
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  )
}
