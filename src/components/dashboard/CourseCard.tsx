import { Link } from 'react-router-dom'
import { Card } from '../ui/Card'
import { ProgressWidget } from './ProgressWidget'

interface CourseCardProps {
  completedLessons: number
  id: string
  title: string
  totalLessons: number
}

export function CourseCard({ completedLessons, id, title, totalLessons }: CourseCardProps) {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <ProgressWidget complete={completedLessons} total={totalLessons} />
      <Link
        className="mt-3 inline-block text-sm font-semibold text-brand-700"
        to={`/courses/${id}`}
      >
        Continue course →
      </Link>
    </Card>
  )
}
