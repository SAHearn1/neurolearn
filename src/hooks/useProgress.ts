import { useMemo } from 'react'
import { useProgressStore } from '../store/progressStore'

export function useProgress() {
  const { items, setItems } = useProgressStore()

  const completedCount = useMemo(() => items.filter((item) => item.completed).length, [items])

  function markLessonCompleted(lessonId: string, userId: string) {
    const existing = items.find((item) => item.lessonId === lessonId && item.userId === userId)
    if (existing) {
      setItems(items.map((item) => (item.id === existing.id ? { ...item, completed: true } : item)))
      return
    }

    setItems([
      ...items,
      {
        completed: true,
        completedAt: new Date().toISOString(),
        id: `${userId}-${lessonId}`,
        lessonId,
        userId,
      },
    ])
  }

  return { completedCount, items, markLessonCompleted }
}
