import { Link } from 'react-router-dom'

export function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to continue your learning streak and resume where you left off.
        </p>

        <form className="mt-6 space-y-4" onSubmit={(event) => event.preventDefault()}>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
              name="email"
              placeholder="you@example.com"
              type="email"
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
              name="password"
              placeholder="••••••••"
              type="password"
            />
          </label>

          <button
            className="w-full rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white transition hover:bg-brand-700"
            type="submit"
          >
            Sign in
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          New to NeuroLearn?{' '}
          <Link className="font-semibold text-brand-700 hover:text-brand-800" to="/signup">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  )
}
