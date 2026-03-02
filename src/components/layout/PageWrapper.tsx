import { Outlet, useLocation } from 'react-router-dom'
import { FocusMode } from './FocusMode'
import { Footer } from './Footer'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

const routesWithoutShell = new Set(['/', '/login', '/signup'])

export function PageWrapper() {
  const location = useLocation()
  const useAppShell = !routesWithoutShell.has(location.pathname)

  if (!useAppShell) {
    return <Outlet />
  }

  const isLessonRoute = /^\/courses\/[^/]+\/lessons\/[^/]+$/.test(location.pathname)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-6 py-6">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <FocusMode enabled={isLessonRoute}>
            <Outlet />
          </FocusMode>
        </main>
      </div>
      <Footer />
    </div>
  )
}
