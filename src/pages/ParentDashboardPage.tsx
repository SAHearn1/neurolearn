import { useState } from 'react'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'
import { Alert } from '../components/ui/Alert'
import { useParentProfile } from '../hooks/useParentProfile'
import { useParentStudentLinks } from '../hooks/useParentStudentLinks'
import { ParentStudentList } from '../components/parent/ParentStudentList'
import { ParentProgressReports } from '../components/parent/ParentProgressReports'
import { ParentNotificationPrefs } from '../components/parent/ParentNotificationPrefs'
import { ParentMessages } from '../components/parent/ParentMessages'

type Tab = 'overview' | 'students' | 'progress' | 'notifications' | 'messages'

export function ParentDashboardPage() {
  const { profile, loading: profileLoading, error: profileError } = useParentProfile()
  const { activeLinks, pendingLinks, loading: linksLoading } = useParentStudentLinks()
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  if (profileLoading || linksLoading) {
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
    { key: 'students', label: 'My Students' },
    { key: 'progress', label: 'Progress Reports' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'messages', label: 'Messages' },
  ]

  return (
    <main id="main-content" className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 p-6">
      <header className="space-y-3">
        <Badge>Parent Dashboard</Badge>
        <h1 className="text-3xl font-bold text-slate-900">Welcome back 👋</h1>
        <p className="text-slate-600">
          Monitor your children&apos;s learning progress and communicate with educators.
        </p>
      </header>

      <nav aria-label="Parent dashboard tabs" className="flex flex-wrap gap-2 border-b border-slate-200 pb-2" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            id={`parent-tab-${tab.key}`}
            role="tab"
            aria-selected={activeTab === tab.key}
            aria-controls={`parent-panel-${tab.key}`}
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

      <div id="parent-panel-overview" role="tabpanel" aria-labelledby="parent-tab-overview" hidden={activeTab !== 'overview'}>
        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-sm font-medium text-slate-500">Linked Students</p>
            <p className="text-2xl font-bold text-slate-900">{activeLinks.length}</p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-slate-500">Pending Links</p>
            <p className="text-2xl font-bold text-slate-900">{pendingLinks.length}</p>
          </Card>
          <Card>
            <p className="text-sm font-medium text-slate-500">Notification Frequency</p>
            <p className="text-2xl font-bold text-slate-900 capitalize">
              {profile?.notification_frequency ?? 'weekly'}
            </p>
          </Card>
        </section>
      </div>

      <div id="parent-panel-students" role="tabpanel" aria-labelledby="parent-tab-students" hidden={activeTab !== 'students'}>
        <ParentStudentList />
      </div>
      <div id="parent-panel-progress" role="tabpanel" aria-labelledby="parent-tab-progress" hidden={activeTab !== 'progress'}>
        <ParentProgressReports />
      </div>
      <div id="parent-panel-notifications" role="tabpanel" aria-labelledby="parent-tab-notifications" hidden={activeTab !== 'notifications'}>
        <ParentNotificationPrefs />
      </div>
      <div id="parent-panel-messages" role="tabpanel" aria-labelledby="parent-tab-messages" hidden={activeTab !== 'messages'}>
        <ParentMessages />
      </div>
    </main>
  )
}
