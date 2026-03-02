import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { useProgress } from '../hooks/useProgress'

export function ProfilePage() {
  const { userId } = useAuth()
  const { isLoading, profile } = useProfile(userId ?? 'demo-user')
  const { completedCount } = useProgress(userId ?? 'demo-user')

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-6">
      <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
      {isLoading ? <p className="text-sm text-slate-500">Loading profile…</p> : null}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">Display name</dt>
            <dd className="font-semibold text-slate-900">{profile.displayName}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Learning style</dt>
            <dd className="font-semibold text-slate-900">{profile.learningStyle}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Reduce motion</dt>
            <dd className="font-semibold text-slate-900">{profile.sensoryPreferences.reduceMotion ? 'Enabled' : 'Disabled'}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Completed lessons</dt>
            <dd className="font-semibold text-slate-900">{completedCount}</dd>
          </div>
        </dl>
      </section>
    </main>
  )
}
