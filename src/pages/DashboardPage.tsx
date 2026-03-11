import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import { TraceRadar } from '../components/ui/TraceRadar'
import { StreakCalendar } from '../components/dashboard/StreakCalendar'
import { useCognitiveProfile } from '../hooks/useCognitiveProfile'
import type { TraceScores } from '../components/ui/TraceRadar'
import { useAdaptiveLearning } from '../hooks/useAdaptiveLearning'
import { useEnrolledCourses } from '../hooks/useEnrollment'
import { useOnboarding } from '../hooks/useOnboarding'
import { useCourseProgress } from '../hooks/useProgress'
import { useProfile } from '../hooks/useProfile'
import { useRacaStreak } from '../hooks/useRacaStreak'
import { useCourses } from '../hooks/useCourses'
import { OnboardingModal } from '../components/onboarding/OnboardingModal'
import { racaFlags } from '../lib/raca/feature-flags'
import { getLevelStatus } from '../lib/xp'
import type { CourseLevel } from '../types/course'

function TraceProfile() {
  const { cognitiveProfile, loading } = useCognitiveProfile()

  if (loading) {
    return <div className="h-48 animate-pulse rounded-lg bg-slate-100" />
  }

  if (!cognitiveProfile?.trace_averages) {
    return (
      <p className="text-sm text-slate-400">
        Complete a deep learning session to see your thinking profile.
      </p>
    )
  }

  const scores: TraceScores = {
    think: cognitiveProfile.trace_averages.think,
    reason: cognitiveProfile.trace_averages.reason,
    articulate: cognitiveProfile.trace_averages.articulate,
    check: cognitiveProfile.trace_averages.check,
    extend: cognitiveProfile.trace_averages.extend,
    ethical: cognitiveProfile.trace_averages.ethical,
  }

  return <TraceRadar scores={scores} />
}

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
  const navigate = useNavigate()
  const { profile, loading: profileLoading } = useProfile()
  const { courses, loading: coursesLoading, error: coursesError } = useEnrolledCourses()
  const { courses: catalogCourses } = useCourses()
  const firstCourse = courses[0]
  const { state: adaptiveState, loading: adaptiveLoading } = useAdaptiveLearning(firstCourse?.id)
  const [pendingMilestone, setPendingMilestone] = useState<MilestoneType | null>(null)
  const { showOnboarding, completeOnboarding } = useOnboarding()
  const {
    racaStreakDays,
    totalRacaSessions,
    reviseSessions,
    defendSessions,
    hasDeepThinkerSession,
  } = useRacaStreak()

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

  // Suppress unused variable warning — navigate is available for future use
  void navigate

  if (profileLoading || coursesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  // Today's Focus section logic
  const todaysFocusHref =
    adaptiveState?.recommended_lesson_id && firstCourse
      ? `/courses/${firstCourse.id}/lessons/${adaptiveState.recommended_lesson_id}`
      : firstCourse
        ? `/courses/${firstCourse.id}`
        : null

  const todaysFocusTitle =
    adaptiveState?.recommended_lesson_id && firstCourse
      ? 'Pick up where you left off'
      : firstCourse
        ? 'Continue your course'
        : null

  const todaysFocusSubtitle = firstCourse?.title ?? null

  const todaysFocusLabel =
    adaptiveState?.recommended_lesson_id && firstCourse ? 'Continue lesson →' : 'Go to course →'

  return (
    <>
      {showOnboarding && <OnboardingModal onComplete={completeOnboarding} />}
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
            {racaStreakDays > 0 && (
              <StatPill icon="🧠" value={racaStreakDays} label="deep work streak" />
            )}
            <StatPill icon="📚" value={lessonsCompleted} label="lessons completed" />
            <StatPill icon="📖" value={courses.length} label="courses enrolled" />
          </div>
          <div className="mt-5 rounded-xl bg-white/10 p-4">
            <XPBar levelStatus={getLevelStatus(lessonsCompleted, streakDays)} />
          </div>
        </section>

        {coursesError && <Alert variant="error">{coursesError}</Alert>}

        {/* Today's Focus */}
        {todaysFocusHref && todaysFocusTitle && (
          <section aria-label="Today's focus">
            <h2 className="mb-3 text-xl font-bold text-slate-900">Today's Focus</h2>
            <div className="flex items-center gap-4 rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-purple-50 p-5 shadow-sm">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 text-xl text-white shadow-brand">
                🎯
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                  Recommended
                </p>
                <p className="text-lg font-bold text-slate-900 truncate">{todaysFocusTitle}</p>
                <p className="text-sm text-slate-500">{todaysFocusSubtitle}</p>
              </div>
              <Link to={todaysFocusHref} className="flex-shrink-0">
                <Button>{todaysFocusLabel}</Button>
              </Link>
            </div>
          </section>
        )}

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
          <section aria-label="Explore courses">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Start Learning</h2>
              <Link to="/courses" className="text-sm font-semibold text-brand-700">
                Browse all →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {catalogCourses.slice(0, 3).map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="card-hover block overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <GradientThumbnail level={course.level as CourseLevel} />
                  <div className="p-4">
                    <Badge>{course.level}</Badge>
                    <h3 className="mt-1 text-base font-semibold text-slate-900 leading-snug">
                      {course.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-400">
                      {course.lesson_count ?? 0} lessons
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            {catalogCourses.length === 0 && (
              <p className="text-sm text-slate-500">No courses available yet — check back soon.</p>
            )}
          </section>
        )}

        {/* Achievements / Badge shelf */}
        <section
          aria-label="Achievements"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
        >
          <BadgeShelf
            lessonsCompleted={lessonsCompleted}
            streakDays={streakDays}
            session={{
              totalRacaSessions,
              reviseSessions,
              defendSessions,
              hasDeepThinkerSession,
              deepWorkStreakDays: racaStreakDays,
            }}
          />
          <div className="mt-5 border-t border-slate-100 pt-5">
            <h3 className="mb-3 text-sm font-bold text-slate-700">Learning Consistency</h3>
            <StreakCalendar />
          </div>
        </section>

        {/* TRACE Cognitive Profile */}
        <section
          aria-label="Thinking profile"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card"
        >
          <h2 className="mb-4 text-xl font-bold text-slate-900">Your Thinking Profile</h2>
          <TraceProfile />
        </section>

        {!adaptiveLoading && racaFlags.epistemicMonitoring && (
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
    </>
  )
}
