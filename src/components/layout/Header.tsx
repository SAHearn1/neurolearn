import { Link, NavLink } from 'react-router-dom'
import { Badge } from '../ui/Badge'

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link className="inline-flex items-center gap-2" to="/">
          <Badge>NeuroLearn</Badge>
        </Link>

        <nav aria-label="Primary" className="flex flex-wrap items-center gap-2 text-sm">
          <NavLink className="rounded px-2 py-1 text-slate-700 hover:bg-slate-100" to="/dashboard">
            Dashboard
          </NavLink>
          <NavLink className="rounded px-2 py-1 text-slate-700 hover:bg-slate-100" to="/courses">
            Courses
          </NavLink>
          <NavLink className="rounded px-2 py-1 text-slate-700 hover:bg-slate-100" to="/profile">
            Profile
          </NavLink>
          <NavLink className="rounded px-2 py-1 text-slate-700 hover:bg-slate-100" to="/settings">
            Settings
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
