import { useState } from 'react'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { UserManagement } from '../components/admin/UserManagement'
import { ContentModeration } from '../components/admin/ContentModeration'
import { SystemAnalytics } from '../components/admin/SystemAnalytics'
import { AuditLogViewer } from '../components/admin/AuditLogViewer'

type Tab = 'overview' | 'users' | 'content' | 'analytics' | 'audit'

export function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'users', label: 'Users' },
    { key: 'content', label: 'Content Moderation' },
    { key: 'analytics', label: 'Analytics' },
    { key: 'audit', label: 'Audit Log' },
  ]

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 p-6">
      <header className="space-y-3">
        <Badge>Admin Dashboard</Badge>
        <h1 className="text-3xl font-bold text-slate-900">System Administration</h1>
        <p className="text-slate-600">
          Manage users, moderate content, view system analytics, and review audit logs.
        </p>
      </header>

      <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-2" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
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
      </nav>

      {activeTab === 'overview' && (
        <section className="grid gap-4 md:grid-cols-4">
          <Card>
            <p className="text-sm font-medium text-slate-500">System Status</p>
            <p className="text-2xl font-bold text-emerald-600">Healthy</p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-slate-500">Uptime</p>
            <p className="text-2xl font-bold text-slate-900">99.9%</p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-slate-500">Active Sessions</p>
            <p className="text-2xl font-bold text-slate-900">—</p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-slate-500">Pending Actions</p>
            <p className="text-2xl font-bold text-slate-900">0</p>
          </Card>
        </section>
      )}

      {activeTab === 'users' && <UserManagement />}
      {activeTab === 'content' && <ContentModeration />}
      {activeTab === 'analytics' && <SystemAnalytics />}
      {activeTab === 'audit' && <AuditLogViewer />}
    </main>
  )
}
