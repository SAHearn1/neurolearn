import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'

interface LessonNavProps {
  backTo: string
  nextTo?: string
}

export function LessonNav({ backTo, nextTo }: LessonNavProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Link to={backTo}>
        <Button variant="secondary">← Back to course</Button>
      </Link>
      {nextTo ? (
        <Link to={nextTo}>
          <Button>Next lesson →</Button>
        </Link>
      ) : null}
    </div>
  )
}
