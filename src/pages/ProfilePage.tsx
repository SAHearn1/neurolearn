import { useProfile } from '../hooks/useProfile'
import { Alert } from '../components/ui/Alert'
import { Spinner } from '../components/ui/Spinner'
import { Avatar } from '../components/ui/Avatar'
import { Badge } from '../components/ui/Badge'

export function ProfilePage() {
  const { profile, loading, error } = useProfile()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <main id="main-content" className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-6">
      <header className="space-y-2">
        <Badge>Profile</Badge>
        <h1 className="text-3xl font-bold text-slate-900">Your Profile</h1>
      </header>

      {error && <Alert variant="error">{error}</Alert>}

      {profile && (
        <>
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <Avatar name={profile.display_name} />
              <div>
                <h2 className="text-xl font-bold text-slate-900">{profile.display_name}</h2>
                <p className="text-sm text-slate-500">Member since {new Date(profile.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-slate-500">Display name</dt>
                <dd className="font-semibold text-slate-900">{profile.display_name}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Learning styles</dt>
                <dd className="font-semibold text-slate-900 capitalize">
                  {profile.learning_styles.length > 0
                    ? profile.learning_styles.join(', ')
                    : 'Not set'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Current streak</dt>
                <dd className="font-semibold text-slate-900">{profile.streak_days} day{profile.streak_days !== 1 ? 's' : ''}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Completed lessons</dt>
                <dd className="font-semibold text-slate-900">{profile.lessons_completed}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Accessibility Preferences</h2>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-slate-500">Text size</dt>
                <dd className="font-semibold text-slate-900 capitalize">{profile.accessibility.text_size}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Reduce motion</dt>
                <dd className="font-semibold text-slate-900">{profile.accessibility.reduce_motion ? 'Enabled' : 'Disabled'}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">High contrast</dt>
                <dd className="font-semibold text-slate-900">{profile.accessibility.high_contrast ? 'Enabled' : 'Disabled'}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Screen reader hints</dt>
                <dd className="font-semibold text-slate-900">{profile.accessibility.screen_reader_hints ? 'Enabled' : 'Disabled'}</dd>
              </div>
            </dl>
          </section>
        </>
      )}

      {!profile && !error && (
        <p className="text-sm text-slate-500">No profile data available.</p>
      )}
    </main>
  )
}
