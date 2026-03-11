import { NavLink } from 'react-router-dom'

const links = [
  { label: 'Overview', to: '/dashboard' },
  { label: 'All Courses', to: '/courses' },
  { label: 'Profile', to: '/profile' },
  { label: 'Accessibility Settings', to: '/settings' },
]

export function Sidebar() {
  return (
    <aside aria-label="Secondary" className="hidden w-64 shrink-0 md:block">
      <div className="sticky top-24 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <ul className="space-y-1">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-700 hover:bg-slate-100'}`
                }
                to={link.to}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
