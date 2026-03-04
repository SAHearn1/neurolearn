import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../../utils/supabase/client'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

const ERROR_MESSAGES: Record<string, string> = {
  otp_expired: 'Your confirmation link has expired. Links are only valid for a short time.',
  access_denied: 'This confirmation link is no longer valid.',
  invalid_grant: 'This confirmation link has already been used or is invalid.',
  email_not_confirmed: 'You need to confirm your email address before you can sign in.',
}

function EmailIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-7 w-7 text-brand-600"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CheckEmailPage() {
  const [searchParams] = useSearchParams()
  const errorCode = searchParams.get('error_code')
  const errorDescription = searchParams.get('error_description')

  const [email, setEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [resendError, setResendError] = useState<string | null>(null)

  const hasError = !!errorCode
  const errorMessage =
    (errorCode && ERROR_MESSAGES[errorCode]) ??
    errorDescription ??
    'Something went wrong with your confirmation link.'

  async function handleResend(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setResendLoading(true)
    setResendError(null)
    setResendSuccess(false)
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim() })
      if (error) throw error
      setResendSuccess(true)
    } catch (err) {
      setResendError(err instanceof Error ? err.message : 'Failed to resend. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  if (hasError) {
    return (
      <main
        id="main-content"
        className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-6"
      >
        <section className="rounded-xl border border-red-100 bg-white p-6 shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <svg
              aria-hidden="true"
              className="h-7 w-7 text-red-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="text-center text-2xl font-bold text-slate-900">Link expired</h1>
          <p className="mt-3 text-center text-slate-600">{errorMessage}</p>

          <div className="mt-6 border-t border-slate-100 pt-6">
            {resendSuccess ? (
              <Alert variant="success">
                New confirmation email sent! Check your inbox and follow the link.
              </Alert>
            ) : (
              <form className="space-y-4" onSubmit={handleResend}>
                <p className="text-sm font-medium text-slate-700">
                  Enter your email to receive a new confirmation link:
                </p>
                <Input
                  label="Email address"
                  autoComplete="email"
                  disabled={resendLoading}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {resendError && <Alert variant="error">{resendError}</Alert>}
                <Button className="w-full" disabled={resendLoading} type="submit">
                  {resendLoading ? 'Sending…' : 'Resend confirmation email'}
                </Button>
              </form>
            )}
          </div>

          <div className="mt-4 text-center">
            <Link className="text-sm font-semibold text-brand-700 hover:text-brand-800" to="/login">
              Back to sign in
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main
      id="main-content"
      className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-6"
    >
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
          <EmailIcon />
        </div>

        <h1 className="text-2xl font-bold text-slate-900">Check your email</h1>
        <p className="mt-3 text-slate-600">
          We&apos;ve sent you a confirmation link. Click the link in your email to activate your
          account and sign in.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Didn&apos;t receive it? Check your spam folder or{' '}
          <Link className="font-semibold text-brand-700 hover:text-brand-800" to="/signup">
            try again with a different address
          </Link>
          .
        </p>

        <div className="mt-6">
          <Link className="text-sm font-semibold text-brand-700 hover:text-brand-800" to="/login">
            Back to sign in
          </Link>
        </div>
      </section>
    </main>
  )
}
