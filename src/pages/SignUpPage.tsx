import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { signUpSchema, getValidationErrors } from '../lib/validation'
import { authRateLimit } from '../lib/rate-limit'

export function SignUpPage() {
  const navigate = useNavigate()
  const { signUp, loading } = useAuthStore()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'learner' | 'educator' | 'parent'>('learner')
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setFieldErrors({})

    const result = signUpSchema.safeParse({
      email,
      password,
      displayName: fullName,
      age_confirmed: ageConfirmed || undefined,
    })
    if (!result.success) {
      setFieldErrors(getValidationErrors(result))
      return
    }

    if (!authRateLimit('signup')) {
      setError('Too many sign-up attempts. Please wait a minute before trying again.')
      return
    }

    try {
      const session = await signUp(email, password, fullName, role)
      // session is null when Supabase requires email confirmation
      navigate(session ? '/dashboard' : '/check-email')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    }
  }

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-6"
    >
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-2 text-sm text-slate-600">
          Start your personalized learning journey in a few quick steps.
        </p>

        {error && (
          <div
            className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            role="alert"
          >
            {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Full name
            <input
              aria-describedby={fieldErrors.displayName ? 'signup-fullname-error' : undefined}
              aria-invalid={Boolean(fieldErrors.displayName)}
              autoComplete="name"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
              name="fullName"
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ada Learner"
              type="text"
              value={fullName}
            />
            {fieldErrors.displayName && (
              <span
                id="signup-fullname-error"
                className="mt-1 block text-xs text-red-600"
                role="alert"
                aria-live="assertive"
              >
                {fieldErrors.displayName}
              </span>
            )}
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              aria-describedby={fieldErrors.email ? 'signup-email-error' : undefined}
              aria-invalid={Boolean(fieldErrors.email)}
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              type="email"
              value={email}
            />
            {fieldErrors.email && (
              <span
                id="signup-email-error"
                className="mt-1 block text-xs text-red-600"
                role="alert"
                aria-live="assertive"
              >
                {fieldErrors.email}
              </span>
            )}
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Password
            <input
              aria-describedby={fieldErrors.password ? 'signup-password-error' : undefined}
              aria-invalid={Boolean(fieldErrors.password)}
              autoComplete="new-password"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              type="password"
              value={password}
            />
            {fieldErrors.password && (
              <span
                id="signup-password-error"
                className="mt-1 block text-xs text-red-600"
                role="alert"
                aria-live="assertive"
              >
                {fieldErrors.password}
              </span>
            )}
            <span className="mt-1 block text-xs text-slate-500">
              At least 8 characters with uppercase, lowercase, and a number
            </span>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            I am a…
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={role}
              onChange={(e) => setRole(e.target.value as 'learner' | 'educator' | 'parent')}
            >
              <option value="learner">Student / Learner</option>
              <option value="educator">Educator</option>
              <option value="parent">Parent / Guardian</option>
            </select>
          </label>

          <div className="flex items-start gap-2">
            <input
              aria-required="true"
              checked={ageConfirmed}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              id="age-confirm"
              onChange={(e) => setAgeConfirmed(e.target.checked)}
              type="checkbox"
            />
            <label className="text-sm text-slate-700" htmlFor="age-confirm">
              I confirm I am 13 years of age or older (or have parental consent)
            </label>
          </div>
          {fieldErrors.age_confirmed && (
            <span className="block text-xs text-red-600" role="alert" aria-live="assertive">
              {fieldErrors.age_confirmed}
            </span>
          )}

          <button
            className="w-full rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
            disabled={loading}
            type="submit"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{' '}
          <Link className="font-semibold text-brand-700 hover:text-brand-800" to="/login">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  )
}
