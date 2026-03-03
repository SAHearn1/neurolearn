import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'
import { Alert } from '../components/ui/Alert'
import { useEducatorProfile } from '../hooks/useEducatorProfile'
import { useClassManagement } from '../hooks/useClassManagement'
import { ClassList } from '../components/educator/ClassList'
import { StudentProgressTable } from '../components/educator/StudentProgressTable'
import { CourseAssignment } from '../components/educator/CourseAssignment'
import { ContentManager } from '../components/educator/ContentManager'
import { EducatorAnalytics } from '../components/educator/EducatorAnalytics'

type Tab = 'overview' | 'classes' | 'progress' | 'assignments' | 'content' | 'analytics'

export function EducatorDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { profile, loading: profileLoading, error: profileError } = useEducatorProfile()
  const { classes, loading: classesLoading } = useClassManagement()
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const displayName = (user?.user_metadata?.display_name as string | undefined) ?? 'Educator'

  if (profileLoading || classesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (profileError) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-6">
        <Alert variant="error">{profileError}</Alert>
      </main>
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'classes', label: 'Classes' },
    { key: 'progress', label: 'Student Progress' },
    { key: 'assignments', label: 'Assignments' },
    { key: 'content', label: 'Content' },
    { key: 'analytics', label: 'Analytics' },
  ]

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-6"
    >
      <header className="space-y-3">
        <Badge>Educator Dashboard</Badge>
        <h1 className="text-3xl font-bold text-slate-900">Welcome, {displayName} 👋</h1>
        <p className="text-slate-600">
          Manage your classes, track student progress, and create learning content.
        </p>
      </header>

      <nav aria-label="Educator dashboard tabs">
        <div
          className="flex flex-wrap gap-2 border-b border-slate-200 pb-2"
          role="tablist"
          tabIndex={-1}
          onKeyDown={(e) => {
            const keys = ['ArrowRight', 'ArrowLeft']
            if (!keys.includes(e.key)) return
            const idx = tabs.findIndex((t) => t.key === activeTab)
            const next =
              e.key === 'ArrowRight'
                ? tabs[(idx + 1) % tabs.length]
                : tabs[(idx - 1 + tabs.length) % tabs.length]
            setActiveTab(next.key)
            document.getElementById(`edu-tab-${next.key}`)?.focus()
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              id={`edu-tab-${tab.key}`}
              role="tab"
              tabIndex={activeTab === tab.key ? 0 : -1}
              aria-selected={activeTab === tab.key}
              aria-controls={`edu-panel-${tab.key}`}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <div
        id="edu-panel-overview"
        role="tabpanel"
        aria-labelledby="edu-tab-overview"
        hidden={activeTab !== 'overview'}
      >
        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-sm font-medium text-slate-500">Active Classes</p>
            <p className="text-2xl font-bold text-slate-900">{classes.length}</p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-slate-500">Subjects</p>
            <p className="text-2xl font-bold text-slate-900">{profile?.subjects.length ?? 0}</p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-slate-500">Profile Status</p>
            <p className="text-2xl font-bold text-slate-900">
              {profile?.accepting_students ? 'Accepting' : 'Closed'}
            </p>
          </Card>
        </section>
      </div>

      <div
        id="edu-panel-classes"
        role="tabpanel"
        aria-labelledby="edu-tab-classes"
        hidden={activeTab !== 'classes'}
      >
        <ClassList />
      </div>
      <div
        id="edu-panel-progress"
        role="tabpanel"
        aria-labelledby="edu-tab-progress"
        hidden={activeTab !== 'progress'}
      >
        <StudentProgressTable />
      </div>
      <div
        id="edu-panel-assignments"
        role="tabpanel"
        aria-labelledby="edu-tab-assignments"
        hidden={activeTab !== 'assignments'}
      >
        <CourseAssignment />
      </div>
      <div
        id="edu-panel-content"
        role="tabpanel"
        aria-labelledby="edu-tab-content"
        hidden={activeTab !== 'content'}
      >
        <ContentManager />
      </div>
      <div
        id="edu-panel-analytics"
        role="tabpanel"
        aria-labelledby="edu-tab-analytics"
        hidden={activeTab !== 'analytics'}
      >
        <EducatorAnalytics />
      </div>
    </main>
  )
}
