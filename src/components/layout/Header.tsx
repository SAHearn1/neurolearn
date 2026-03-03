import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { useAuthStore } from '../../store/authStore'

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Courses', to: '/courses' },
  { label: 'Profile', to: '/profile' },
  { label: 'Settings', to: '/settings' },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link className="inline-flex items-center gap-2" to="/">
          <Badge>NeuroLearn</Badge>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden items-center gap-2 text-sm md:flex">
          {NAV_ITEMS.map((item) => (
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
          {user && (
            <Button
              variant="ghost"
              onClick={() => signOut()}
              className="text-slate-600 hover:text-slate-900"
            >
              Sign out
            </Button>
          )}
        </nav>

        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </Button>
      </div>

      {/* Mobile nav dropdown */}
      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-slate-200 px-6 py-3 md:hidden"
        >
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  className={({ isActive }) =>
                    `block rounded px-3 py-2 text-sm ${isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-700 hover:bg-slate-100'}`
                  }
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            {user && (
              <li>
                <button
                  className="block w-full rounded px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                  onClick={() => {
                    setMobileOpen(false)
                    signOut()
                  }}
                >
                  Sign out
                </button>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  )
}
