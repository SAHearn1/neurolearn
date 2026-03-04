import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../components/ui/Avatar'
import { Alert } from '../components/ui/Alert'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Spinner } from '../components/ui/Spinner'
import {
  MilestoneCelebration,
  checkMilestone,
  type MilestoneType,
} from '../components/learner/MilestoneCelebration'
import { useAdaptiveLearning } from '../hooks/useAdaptiveLearning'
import { useEnrolledCourses } from '../hooks/useEnrollment'
import { useCourseProgress } from '../hooks/useProgress'
import { useProfile } from '../hooks/useProfile'
import { racaFlags } from '../lib/raca/feature-flags'
import { StreakBadge } from '../components/dashboard/StreakBadge'

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

function CourseCardWithProgress({
  courseId,
  title,
  level,
}: {
  courseId: string
  title: string
  level: string
}) {
  const { progress } = useCourseProgress(courseId)
  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-brand-700">{level}</p>
      <ProgressBar label="progress" value={progress?.percent_complete ?? 0} />
      <Link
        className="mt-4 inline-block text-sm font-semibold text-brand-700"
        to={`/courses/${courseId}`}
      >
        Continue course &rarr;
      </Link>
    </Card>
  )
}

export function DashboardPage() {
  const { profile, loading: profileLoading } = useProfile()
  const { courses, loading: coursesLoading, error: coursesError } = useEnrolledCourses()
  const firstCourseId = courses[0]?.id
  const { state: adaptiveState, loading: adaptiveLoading } = useAdaptiveLearning(firstCourseId)
  const [pendingMilestone, setPendingMilestone] = useState<MilestoneType | null>(null)

  const displayName = profile?.display_name ?? 'learner'

  // Check for newly earned milestones once profile loads
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
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 p-6"
    >
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge>Dashboard</Badge>
          {(profile?.streak_days ?? 0) > 0 && <StreakBadge days={profile!.streak_days} />}
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome back, {displayName}</h1>
            <p className="text-slate-600">
              Your progress overview and quick links for your next session.
            </p>
          </div>
          <Avatar name={displayName} />
        </div>
      </header>

      {coursesError && <Alert variant="error">{coursesError}</Alert>}

      {courses.length > 0 ? (
        <section aria-label="Enrolled courses" className="grid gap-4 md:grid-cols-2">
          {courses.slice(0, 4).map((course) => (
            <CourseCardWithProgress
              key={course.id}
              courseId={course.id}
              title={course.title}
              level={course.level}
            />
          ))}
        </section>
      ) : (
        <section>
          <p className="text-sm text-slate-500">
            You are not enrolled in any courses yet.{' '}
            <Link className="font-semibold text-brand-700" to="/courses">
              Browse the catalog &rarr;
            </Link>
          </p>
        </section>
      )}

      <section aria-label="Recommended next lesson">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Recommended for You</h2>
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
          <h2 className="text-xl font-bold text-slate-900 mb-3">Cognitive Profile</h2>
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
