import { useEffect } from 'react'
import { useProgressStore } from '../store/progressStore'
import { useAuthStore } from '../store/authStore'

export function useCourseProgress(courseId: string | undefined) {
  const user = useAuthStore((s) => s.user)
  const courseProgress = useProgressStore((s) =>
    courseId ? s.courseProgress[courseId] : undefined,
  )
  const loading = useProgressStore((s) => s.loading)
  const fetchCourseProgress = useProgressStore((s) => s.fetchCourseProgress)

  useEffect(() => {
    if (user?.id && courseId) {
      fetchCourseProgress(user.id, courseId)
    }
  }, [user?.id, courseId, fetchCourseProgress])

  return { progress: courseProgress, loading }
}

export function useLessonProgress(lessonId: string | undefined) {
  const user = useAuthStore((s) => s.user)
  const lessonProgress = useProgressStore((s) =>
    lessonId ? s.lessonProgress[lessonId] : undefined,
  )
  const fetchLessonProgress = useProgressStore((s) => s.fetchLessonProgress)
  const updateLessonProgress = useProgressStore((s) => s.updateLessonProgress)

  useEffect(() => {
    if (user?.id && lessonId) {
      fetchLessonProgress(user.id, lessonId)
    }
  }, [user?.id, lessonId, fetchLessonProgress])

  return { progress: lessonProgress, updateProgress: updateLessonProgress }
}
