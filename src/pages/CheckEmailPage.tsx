import { Link } from 'react-router-dom'

export function CheckEmailPage() {
  return (
    <main id="main-content" className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50">
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
        </div>

        <h1 className="text-2xl font-bold text-slate-900">Check your email</h1>
        <p className="mt-3 text-slate-600">
          We&apos;ve sent you a confirmation link. Click the link in your email to
          activate your account and sign in.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Didn&apos;t receive it? Check your spam folder or{' '}
          <Link className="font-semibold text-brand-700 hover:text-brand-800" to="/signup">
            try again with a different address
          </Link>
          .
        </p>

        <div className="mt-6">
          <Link
            className="text-sm font-semibold text-brand-700 hover:text-brand-800"
            to="/login"
          >
            Back to sign in
          </Link>
        </div>
      </section>
    </main>
  )
}
