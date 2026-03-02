import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">404</p>
      <h1 className="text-3xl font-bold text-slate-900">Page not found</h1>
      <p className="text-slate-600">The page you are looking for does not exist yet.</p>
      <Link className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white" to="/">
        Return home
      </Link>
    </main>
  )
}
