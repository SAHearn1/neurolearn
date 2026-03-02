import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Alert } from '../components/ui/Alert'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function SignUpPage() {
  const navigate = useNavigate()
  const { authError, clearError, isLoading, signUp } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearError()

    const ok = await signUp(email, password)
    if (ok) {
      navigate('/dashboard')
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="mt-2 text-sm text-slate-600">
          Start your personalized learning journey in a few quick steps.
        </p>

        {authError ? <Alert className="mt-4" variant="error">{authError}</Alert> : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Full name"
            name="fullName"
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Ada Learner"
            required
            type="text"
            value={fullName}
          />

          <Input
            label="Email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />

          <Input
            label="Password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a strong password"
            required
            type="password"
            value={password}
          />

          <Button className="w-full" disabled={isLoading} type="submit">
            {isLoading ? 'Creating account…' : 'Create account'}
          </Button>
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
