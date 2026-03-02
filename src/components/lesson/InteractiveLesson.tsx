import type { ReactNode } from 'react'

interface InteractiveLessonProps {
  children: ReactNode
  instructions: string
}

export function InteractiveLesson({ children, instructions }: InteractiveLessonProps) {
  return (
    <section className="rounded-xl border border-brand-300 bg-brand-50 p-4">
      <p className="mb-3 text-sm font-medium text-brand-800">{instructions}</p>
      {children}
    </section>
  )
}
