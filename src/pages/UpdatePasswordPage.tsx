import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../utils/supabase/client'
import { passwordSchema, getValidationErrors } from '../lib/validation'

export function UpdatePasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  // true once Supabase emits PASSWORD_RECOVERY for this tab
  const [recoveryReady, setRecoveryReady] = useState(false)

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY when the user follows a reset link.
    // The URL fragment contains the access token; the client library handles
    // exchanging it and emitting this event.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setFieldErrors({})

    const result = passwordSchema.safeParse(password)
    if (!result.success) {
      setFieldErrors(getValidationErrors({ success: false, error: result.error } as Parameters<typeof getValidationErrors>[0]))
      return
    }

    if (password !== confirm) {
      setFieldErrors({ confirm: 'Passwords do not match' })
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError
      // Sign out so the user re-authenticates with the new password
      await supabase.auth.signOut()
      navigate('/login', {
        replace: true,
        state: { message: 'Password updated successfully. Please sign in.' },
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!recoveryReady) {
    return (
      <main id="main-content" className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-6">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-center">
          <h1 className="text-2xl font-bold text-slate-900">Waiting for reset link…</h1>
          <p className="mt-3 text-slate-600">
            Please follow the password reset link from your email. If you arrived here
            directly,{' '}
            <Link className="font-semibold text-brand-700 hover:text-brand-800" to="/reset-password">
              request a new reset link
            </Link>
            .
          </p>
        </section>
      </main>
    )
  }

  return (
    <main id="main-content" className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Set a new password</h1>
        <p className="mt-2 text-sm text-slate-600">
          Choose a strong password for your account.
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
            New password
            <input
              autoComplete="new-password"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
              name="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              type="password"
              value={password}
            />
            {fieldErrors.password && (
              <span className="mt-1 block text-xs text-red-600">{fieldErrors.password}</span>
            )}
            <span className="mt-1 block text-xs text-slate-500">
              At least 8 characters with uppercase, lowercase, and a number
            </span>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Confirm new password
            <input
              autoComplete="new-password"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
              name="confirm"
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your new password"
              type="password"
              value={confirm}
            />
            {fieldErrors.confirm && (
              <span className="mt-1 block text-xs text-red-600">{fieldErrors.confirm}</span>
            )}
          </label>

          <button
            className="w-full rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-50"
            disabled={loading}
            type="submit"
          >
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </section>
    </main>
  )
}
