export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-4 text-sm text-slate-600">
        © {new Date().getFullYear()} NeuroLearn. Accessible learning, thoughtfully designed.
      </div>
    </footer>
  )
}
