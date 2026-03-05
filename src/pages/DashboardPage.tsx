import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert } from '../components/ui/Alert'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { GradientThumbnail } from '../components/ui/GradientThumbnail'
import { ProgressBar } from '../components/ui/ProgressBar'
import { ProgressRing } from '../components/ui/ProgressRing'
import { Spinner } from '../components/ui/Spinner'
import { StatPill } from '../components/ui/StatPill'
import {
  MilestoneCelebration,
  checkMilestone,
  type MilestoneType,
} from '../components/learner/MilestoneCelebration'
import { BadgeShelf } from '../components/gamification/BadgeShelf'
import { XPBar } from '../components/ui/XPBar'
import { useAdaptiveLearning } from '../hooks/useAdaptiveLearning'
import { useEnrolledCourses } from '../hooks/useEnrollment'
import { useCourseProgress } from '../hooks/useProgress'
import { useProfile } from '../hooks/useProfile'
import { racaFlags } from '../lib/raca/feature-flags'
import { getLevelStatus } from '../lib/xp'
import type { CourseLevel } from '../types/course'

const MILESTONE_KEY = 'neurolearn_seen_milestones'
function getSeenMilestones(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(MILESTONE_KEY) ?? '[]'))
  } catch {
    return new Set()
  }
}
function markMilestoneSeen(milestone: string) {
  const seen = getSeenMilestones()
  seen.add(milestone)
  localStorage.setItem(MILESTONE_KEY, JSON.stringify([...seen]))
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function CourseCardWithProgress({
  courseId,
  title,
  level,
}: {
  courseId: string
  title: string
  level: CourseLevel
}) {
  const { progress } = useCourseProgress(courseId)
  const pct = progress?.percent_complete ?? 0

  return (
    <Link
      to={`/courses/${courseId}`}
      className="card-hover block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <GradientThumbnail level={level} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Badge>{level}</Badge>
            <h2 className="mt-1 text-base font-semibold text-slate-900 leading-snug">{title}</h2>
          </div>
          <ProgressRing value={pct} size={52} />
        </div>
        <span className="mt-3 inline-block text-sm font-semibold text-brand-700">
          Continue course →
        </span>
      </div>
    </Link>
  )
}

function ContinueLearningCard({
  courseId,
  title,
  level,
}: {
  courseId: string
  title: string
  level: CourseLevel
}) {
  const { progress } = useCourseProgress(courseId)
  const pct = progress?.percent_complete ?? 0
  const completed = progress?.completed_lessons ?? 0
  const total = progress?.total_lessons ?? 0

  return (
    <div className="card-hover overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex">
        <div
          className={`w-2 flex-shrink-0 ${level === 'beginner' ? 'bg-grad-beginner' : level === 'intermediate' ? 'bg-grad-intermediate' : 'bg-grad-advanced'}`}
        />
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Badge>{level}</Badge>
              <h2 className="mt-1 text-xl font-bold text-slate-900">{title}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {completed === 0
                  ? 'Start your journey'
                  : `${completed} of ${total} lessons complete`}
              </p>
            </div>
            <ProgressRing value={pct} size={64} />
          </div>
          <ProgressBar value={pct} />
          <Link to={`/courses/${courseId}`}>
            <Button className="mt-4">Continue →</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { profile, loading: profileLoading } = useProfile()
  const { courses, loading: coursesLoading, error: coursesError } = useEnrolledCourses()
  const firstCourse = courses[0]
  const { state: adaptiveState, loading: adaptiveLoading } = useAdaptiveLearning(firstCourse?.id)
  const [pendingMilestone, setPendingMilestone] = useState<MilestoneType | null>(null)

  const displayName = profile?.display_name ?? 'learner'
  const streakDays = profile?.streak_days ?? 0
  const lessonsCompleted = profile?.lessons_completed ?? 0

  const greeting = useMemo(() => getGreeting(), [])

  useEffect(() => {
    if (!profile) return
    const milestone = checkMilestone(
      profile.lessons_completed ?? 0,
      profile.streak_days ?? 0,
      false,
    )
    if (milestone && !getSeenMilestones().has(milestone)) {
      markMilestoneSeen(milestone)
      Promise.resolve().then(() => setPendingMilestone(milestone))
    }
  }, [profile])

  if (profileLoading || coursesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <main id="main-content" className="mx-auto w-full max-w-5xl flex flex-col gap-8 p-6">
      {/* Greeting hero */}
      <section aria-label="Welcome" className="rounded-2xl bg-grad-hero p-6 text-white shadow-lg">
        <p className="text-sm font-medium opacity-80">{greeting},</p>
        <h1 className="mt-1 text-3xl font-bold">{displayName}</h1>
        <p className="mt-1 text-base opacity-90">
          {streakDays > 0
            ? 'Ready to keep your streak going?'
            : 'Start your learning journey today!'}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {streakDays > 0 && <StatPill icon="🔥" value={streakDays} label="day streak" pulse />}
          <StatPill icon="📚" value={lessonsCompleted} label="lessons completed" />
          <StatPill icon="📖" value={courses.length} label="courses enrolled" />
        </div>
        <div className="mt-5 rounded-xl bg-white/10 p-4">
          <XPBar levelStatus={getLevelStatus(lessonsCompleted, streakDays)} />
        </div>
      </section>

      {coursesError && <Alert variant="error">{coursesError}</Alert>}

      {/* Continue Learning */}
      {firstCourse && (
        <section aria-label="Continue learning">
          <h2 className="mb-3 text-xl font-bold text-slate-900">Continue Learning</h2>
          <ContinueLearningCard
            courseId={firstCourse.id}
            title={firstCourse.title}
            level={firstCourse.level as CourseLevel}
          />
        </section>
      )}

      {/* Course grid */}
      {courses.length > 0 ? (
        <section aria-label="Your courses">
          <h2 className="mb-3 text-xl font-bold text-slate-900">Your Courses</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {courses.slice(0, 6).map((course) => (
              <CourseCardWithProgress
                key={course.id}
                courseId={course.id}
                title={course.title}
                level={course.level as CourseLevel}
              />
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
          <p className="text-2xl">📚</p>
          <p className="mt-2 font-semibold text-slate-700">No courses yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Browse the catalog to find your first course.
          </p>
          <Link to="/courses">
            <Button className="mt-4" variant="secondary">
              Browse courses
            </Button>
          </Link>
        </section>
      )}

      {/* Achievements / Badge shelf */}
      <section
        aria-label="Achievements"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
      >
        <BadgeShelf lessonsCompleted={lessonsCompleted} streakDays={streakDays} />
      </section>

      {/* Adaptive recommendation */}
      <section aria-label="Recommended next lesson">
        <h2 className="mb-3 text-xl font-bold text-slate-900">Recommended for You</h2>
        {adaptiveLoading ? (
          <Spinner />
        ) : adaptiveState?.recommended_lesson_id ? (
          <Card>
            <p className="text-sm text-slate-600">
              Based on your performance (mastery: <strong>{adaptiveState.mastery_score}%</strong>),
              we recommend continuing at <strong>{adaptiveState.current_difficulty}</strong>{' '}
              difficulty.
            </p>
            <Link className="mt-2 inline-block text-sm font-semibold text-brand-700" to="/courses">
              View recommendations →
            </Link>
          </Card>
        ) : (
          <p className="text-sm text-slate-500">
            Complete a lesson to get personalized recommendations.
          </p>
        )}
      </section>

      {racaFlags.epistemicMonitoring && (
        <section aria-label="Cognitive profile">
          <h2 className="mb-3 text-xl font-bold text-slate-900">Cognitive Profile</h2>
          <Card>
            <p className="text-sm text-slate-600">
              Your epistemic monitoring dashboard is active. Visit a RACA session to see detailed
              insights.
            </p>
          </Card>
        </section>
      )}

      <nav aria-label="Quick links" className="flex flex-wrap gap-3">
        <Link to="/courses">
          <Button variant="secondary">Browse courses</Button>
        </Link>
        <Link to="/profile">
          <Button variant="secondary">View profile</Button>
        </Link>
        <Link to="/settings">
          <Button variant="secondary">Update settings</Button>
        </Link>
      </nav>

      {pendingMilestone && (
        <MilestoneCelebration
          milestone={pendingMilestone}
          onDismiss={() => setPendingMilestone(null)}
        />
      )}
    </main>
  )
}
