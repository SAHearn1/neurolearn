import { Link, NavLink } from 'react-router-dom'
import { Badge } from '../ui/Badge'

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <a
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-700 focus:shadow"
        href="#main-content"
      >
        Skip to main content
      </a>

      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link className="inline-flex items-center gap-2" to="/">
          <Badge>NeuroLearn</Badge>
        </Link>

        <nav aria-label="Primary" className="flex flex-wrap items-center gap-2 text-sm">
          {[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'Courses', to: '/courses' },
            { label: 'Profile', to: '/profile' },
            { label: 'Settings', to: '/settings' },
          ].map((item) => (
            <NavLink
              className={({ isActive }) =>
                `rounded px-2 py-1 ${isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-700 hover:bg-slate-100'}`
              }
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
