import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center gap-8 p-6">
      <section className="space-y-4 text-center md:text-left">
        <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
          NeuroLearn
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Learning that adapts to how your brain works best
        </h1>
        <p className="max-w-2xl text-lg text-slate-700">
          Build confidence with accessible, multimodal lessons designed for neurodivergent learners.
          Choose your pace, celebrate progress, and make every session feel achievable.
        </p>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link
          className="rounded-lg bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          to="/signup"
        >
          Get started
        </Link>
        <Link
          className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
          to="/login"
        >
          I already have an account
        </Link>
      </section>
    </main>
  )
}
