import { Link } from 'react-router-dom'

const FEATURES = [
  {
    icon: '🎧',
    title: 'Multimodal Lessons',
    description: 'Audio, visual, and interactive formats tailored to how you learn best.',
  },
  {
    icon: '🧠',
    title: 'Adapts to You',
    description: 'Smart pacing and difficulty that responds to your performance in real time.',
  },
  {
    icon: '♿',
    title: 'Accessibility First',
    description: 'Dyslexia fonts, reduced motion, keyboard navigation, and screen reader support.',
  },
]

export function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center bg-grad-hero px-6 py-20 text-center text-white">
        <span className="mb-4 inline-flex rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">
          NeuroLearn
        </span>
        <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight md:text-5xl">
          Learning that adapts to how your brain works best
        </h1>
        <p className="mt-4 max-w-xl text-lg opacity-90">
          Build confidence with accessible, multimodal lessons designed for neurodivergent learners.
          Choose your pace, celebrate every win.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            className="rounded-lg bg-white px-6 py-3 text-sm font-bold text-brand-700 shadow transition hover:bg-brand-50"
            to="/signup"
          >
            Get started — it's free
          </Link>
          <Link
            className="rounded-lg border border-white/40 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
            to="/login"
          >
            I already have an account
          </Link>
        </div>
      </section>

      {/* Feature strip */}
      <section
        aria-label="Key features"
        className="mx-auto grid w-full max-w-5xl gap-6 px-6 py-16 sm:grid-cols-3"
      >
        {FEATURES.map(({ icon, title, description }) => (
          <div
            key={title}
            className="card-hover rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-center"
          >
            <span className="text-3xl" aria-hidden="true">
              {icon}
            </span>
            <h2 className="mt-3 text-base font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
