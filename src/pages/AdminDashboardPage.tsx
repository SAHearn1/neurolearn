import { useState } from 'react'
import { Alert } from '../components/ui/Alert'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { UserManagement } from '../components/admin/UserManagement'
import { ContentModeration } from '../components/admin/ContentModeration'
import { SystemAnalytics } from '../components/admin/SystemAnalytics'
import { AuditLogViewer } from '../components/admin/AuditLogViewer'
import { IntelligenceDashboard } from '../components/admin/IntelligenceDashboard'
import { useAdminStats } from '../hooks/useAdminStats'

type Tab = 'overview' | 'users' | 'content' | 'analytics' | 'audit' | 'intelligence'

export function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const { stats, loading: statsLoading, error: statsError } = useAdminStats()

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'users', label: 'Users' },
    { key: 'content', label: 'Content Moderation' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'audit', label: 'Audit Log' },
    { key: 'intelligence', label: 'Platform Intelligence' },
  ]

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 p-6"
    >
      <header className="space-y-3">
        <Badge>Admin Dashboard</Badge>
        <h1 className="text-3xl font-bold text-slate-900">System Administration</h1>
        <p className="text-slate-600">
          Manage users, moderate content, view system analytics, and review audit logs.
        </p>
      </header>

      <nav aria-label="Admin dashboard tabs">
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
            document.getElementById(`admin-tab-${next.key}`)?.focus()
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              id={`admin-tab-${tab.key}`}
              role="tab"
              tabIndex={activeTab === tab.key ? 0 : -1}
              aria-selected={activeTab === tab.key}
              aria-controls={`admin-panel-${tab.key}`}
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
        id="admin-panel-overview"
        role="tabpanel"
        aria-labelledby="admin-tab-overview"
        hidden={activeTab !== 'overview'}
      >
        {statsError && (
          <Alert variant="error" className="mb-4">
            {statsError}
          </Alert>
        )}
        <section className="grid gap-4 md:grid-cols-4">
          <Card>
            <p className="text-sm font-medium text-slate-500">Total Users</p>
            {statsLoading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-slate-200" />
            ) : (
              <p className="text-2xl font-bold text-slate-900">{stats?.totalUsers ?? 0}</p>
            )}
          </Card>
          <Card>
            <p className="text-sm font-medium text-slate-500">Active Learners</p>
            {statsLoading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-slate-200" />
            ) : (
              <p className="text-2xl font-bold text-slate-900">{stats?.activeLearners ?? 0}</p>
            )}
          </Card>
          <Card>
            <p className="text-sm font-medium text-slate-500">Total Courses</p>
            {statsLoading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-slate-200" />
            ) : (
              <p className="text-2xl font-bold text-slate-900">{stats?.totalCourses ?? 0}</p>
            )}
          </Card>
          <Card>
            <p className="text-sm font-medium text-slate-500">Lessons Completed</p>
            {statsLoading ? (
              <div className="h-8 w-16 animate-pulse rounded bg-slate-200" />
            ) : (
              <p className="text-2xl font-bold text-slate-900">{stats?.lessonsCompleted ?? 0}</p>
            )}
          </Card>
        </section>
      </div>

      <div
        id="admin-panel-users"
        role="tabpanel"
        aria-labelledby="admin-tab-users"
        hidden={activeTab !== 'users'}
      >
        <UserManagement />
      </div>
      <div
        id="admin-panel-content"
        role="tabpanel"
        aria-labelledby="admin-tab-content"
        hidden={activeTab !== 'content'}
      >
        <ContentModeration />
      </div>
      <div
        id="admin-panel-analytics"
        role="tabpanel"
        aria-labelledby="admin-tab-analytics"
        hidden={activeTab !== 'analytics'}
      >
        <SystemAnalytics />
      </div>
      <div
        id="admin-panel-audit"
        role="tabpanel"
        aria-labelledby="admin-tab-audit"
        hidden={activeTab !== 'audit'}
      >
        <AuditLogViewer />
      </div>
      <div
        id="admin-panel-intelligence"
        role="tabpanel"
        aria-labelledby="admin-tab-intelligence"
        hidden={activeTab !== 'intelligence'}
      >
        <IntelligenceDashboard />
      </div>
    </main>
  )
}
