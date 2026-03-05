import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { useAuthStore } from '../../store/authStore'
import { useProfile } from '../../hooks/useProfile'

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Courses', to: '/courses' },
  { label: 'Profile', to: '/profile' },
  { label: 'Settings', to: '/settings' },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const { profile } = useProfile()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const displayName = profile?.display_name ?? user?.email ?? 'User'

  return (
    <header
      className={`sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur transition-shadow ${scrolled ? 'shadow-sm' : ''}`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link className="inline-flex items-center gap-2" to="/">
          <span className="text-lg font-bold bg-grad-hero bg-clip-text text-transparent">
            NeuroLearn
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden items-center gap-1 text-sm md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              className={({ isActive }) =>
                `px-3 py-1.5 rounded transition-colors ${
                  isActive
                    ? 'border-b-2 border-brand-500 font-semibold text-brand-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`
              }
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
          {user && (
            <div className="ml-2 flex items-center gap-3">
              <Avatar name={displayName} />
              <Button
                variant="ghost"
                onClick={() => signOut()}
                className="text-slate-600 hover:text-slate-900"
              >
                Sign out
              </Button>
            </div>
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

      {/* Mobile nav — slide down */}
      <nav
        aria-label="Mobile navigation"
        className={`overflow-hidden border-t border-slate-200 transition-all duration-200 md:hidden ${mobileOpen ? 'max-h-96' : 'max-h-0'}`}
      >
        <ul className="space-y-1 px-6 py-3">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                className={({ isActive }) =>
                  `block rounded px-3 py-2 text-sm ${isActive ? 'bg-brand-50 font-semibold text-brand-800' : 'text-slate-700 hover:bg-slate-100'}`
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
    </header>
  )
}
