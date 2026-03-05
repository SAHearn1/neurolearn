import { Link } from 'react-router-dom'
import { Badge } from '../ui/Badge'
import { GradientThumbnail } from '../ui/GradientThumbnail'
import { ProgressRing } from '../ui/ProgressRing'
import { ProgressWidget } from './ProgressWidget'
import type { CourseLevel } from '../../types/course'

interface CourseCardProps {
  completedLessons: number
  id: string
  level: CourseLevel
  title: string
  totalLessons: number
}

export function CourseCard({ completedLessons, id, level, title, totalLessons }: CourseCardProps) {
  const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  return (
    <div className="card-hover overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <GradientThumbnail level={level} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Badge>{level}</Badge>
            <h3 className="mt-1 text-base font-semibold text-slate-900 leading-snug">{title}</h3>
          </div>
          <ProgressRing value={pct} size={52} />
        </div>
        <ProgressWidget complete={completedLessons} total={totalLessons} />
        <Link
          className="mt-3 inline-block text-sm font-semibold text-brand-700"
          to={`/courses/${id}`}
        >
          Continue course →
        </Link>
      </div>
    </div>
  )
}
