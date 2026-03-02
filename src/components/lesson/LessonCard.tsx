import type { ReactNode } from 'react'
import { Card } from '../ui/Card'

interface LessonCardProps {
  children?: ReactNode
  title: string
  type: 'text' | 'audio' | 'video' | 'interactive'
}

export function LessonCard({ children, title, type }: LessonCardProps) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{type}</p>
      <h3 className="mt-1 text-lg font-semibold text-slate-900">{title}</h3>
      {children ? <div className="mt-3 text-slate-700">{children}</div> : null}
    </Card>
  )
}
