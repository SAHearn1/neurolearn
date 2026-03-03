import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { signInSchema, getValidationErrors } from '../lib/validation'
import { authRateLimit } from '../lib/rate-limit'

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, loading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setFieldErrors({})

    const result = signInSchema.safeParse({ email, password })
    if (!result.success) {
      setFieldErrors(getValidationErrors(result))
      return
    }

    if (!authRateLimit('login')) {
      setError('Too many login attempts. Please wait a minute before trying again.')
      return
    }

    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    }
  }

  return (
    <main id="main-content" className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to continue your learning streak and resume where you left off.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              type="email"
              value={email}
            />
            {fieldErrors.email && (
              <span className="mt-1 block text-xs text-red-600">{fieldErrors.email}</span>
            )}
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              type="password"
              value={password}
            />
            {fieldErrors.password && (
              <span className="mt-1 block text-xs text-red-600">{fieldErrors.password}</span>
            )}
          </label>

          <button
            className="w-full rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
            disabled={loading}
            type="submit"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <Link className="font-semibold text-brand-700 hover:text-brand-800" to="/reset-password">
            Forgot password?
          </Link>
          <span className="text-slate-600">
            New here?{' '}
            <Link className="font-semibold text-brand-700 hover:text-brand-800" to="/signup">
              Create account
            </Link>
          </span>
        </div>
      </section>
    </main>
  )
}
