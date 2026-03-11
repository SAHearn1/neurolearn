import { useMemo } from 'react'
import { useActivityHeatmap } from '../../hooks/useActivityHeatmap'
import { useSettingsStore } from '../../store/settingsStore'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const WEEKS = 12

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function StreakCalendar() {
  const { data, loading } = useActivityHeatmap()
  const reduceMotion = useSettingsStore((s) => s.accessibility.reduce_motion)
  const highContrast = useSettingsStore((s) => s.accessibility.high_contrast)

  const grid = useMemo(() => {
    // Build an 84-day grid ending today, starting on Monday
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = isoDate(today)

    // Go back to the most recent Monday
    const dayOfWeek = today.getDay() // 0=Sun
    const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const gridStart = new Date(today)
    gridStart.setDate(gridStart.getDate() - offset - (WEEKS - 1) * 7)

    const weeks: { date: string; isToday: boolean; label: string }[][] = []
    const cur = new Date(gridStart)

    for (let w = 0; w < WEEKS; w++) {
      const week: { date: string; isToday: boolean; label: string }[] = []
      for (let d = 0; d < 7; d++) {
        const dateStr = isoDate(cur)
        week.push({
          date: dateStr,
          isToday: dateStr === todayStr,
          label: cur.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }),
        })
        cur.setDate(cur.getDate() + 1)
      }
      weeks.push(week)
    }

    return weeks
  }, [])

  if (loading) {
    return <div className="h-24 animate-pulse rounded-lg bg-slate-100" />
  }

  return (
    <div>
      <div className="mb-1 flex gap-1 pl-8">
        {/* Month labels for first day of each month visible */}
        {grid.map((week, wi) => {
          const firstDate = week[0].date
          const d = new Date(firstDate)
          const show = d.getDate() <= 7
          return (
            <div key={wi} className="w-5 text-center">
              {show ? (
                <span className="text-[9px] text-slate-400">
                  {d.toLocaleDateString('en-US', { month: 'short' })}
                </span>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 pr-1">
          {DAYS.map((day, i) => (
            <div key={day} className="flex h-5 items-center">
              {i % 2 === 0 ? <span className="text-[9px] text-slate-400">{day}</span> : null}
            </div>
          ))}
        </div>

        {/* Grid */}
        {grid.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map(({ date, isToday, label }) => {
              const activity = data.get(date)
              const hasLesson = (activity?.lessonCount ?? 0) > 0
              const hasDeep = activity?.hasDeepSession ?? false

              let bg = highContrast ? 'bg-slate-200' : 'bg-slate-100'
              if (hasDeep) bg = highContrast ? 'bg-purple-900' : 'bg-purple-500'
              else if (hasLesson) bg = highContrast ? 'bg-brand-900' : 'bg-brand-400'

              const activityLabel = activity
                ? `${activity.lessonCount} lesson${activity.lessonCount !== 1 ? 's' : ''}${hasDeep ? ', 1 deep session' : ''}`
                : 'No activity'

              return (
                <div
                  key={date}
                  title={`${label} — ${activityLabel}`}
                  role="gridcell"
                  aria-label={`${label}, ${activityLabel}`}
                  className={`h-5 w-5 rounded-sm ${bg} ${
                    isToday ? 'ring-2 ring-brand-400 ring-offset-1' : ''
                  } ${!reduceMotion ? 'transition-colors' : ''}`}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center gap-4 text-[10px] text-slate-400">
        <div className="flex items-center gap-1">
          <div className={`h-3 w-3 rounded-sm ${highContrast ? 'bg-brand-900' : 'bg-brand-400'}`} />
          <span>Lesson day</span>
        </div>
        <div className="flex items-center gap-1">
          <div
            className={`h-3 w-3 rounded-sm ${highContrast ? 'bg-purple-900' : 'bg-purple-500'}`}
          />
          <span>Deep session</span>
        </div>
      </div>
    </div>
  )
}
