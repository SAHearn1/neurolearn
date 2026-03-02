export function ProfilePage() {
  return (
    <main id="main-content" className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-6">
      <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">Display name</dt>
            <dd className="font-semibold text-slate-900">Ada Learner</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Learning style</dt>
            <dd className="font-semibold text-slate-900">Visual + kinesthetic</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Current streak</dt>
            <dd className="font-semibold text-slate-900">8 days</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Completed lessons</dt>
            <dd className="font-semibold text-slate-900">21</dd>
          </div>
        </dl>
      </section>
    </main>
  )
}
