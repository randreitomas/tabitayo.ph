import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogoFull } from '@/components/logo/LogoFull'
import { useAuthContext } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'

interface NavItem {
  to: string
  label: string
  end?: boolean
}

interface DashboardLayoutProps {
  basePath: '/host' | '/admin'
  navItems: NavItem[]
  title: string
}

export function DashboardLayout({ basePath, navItems, title }: DashboardLayoutProps) {
  const { user, logout } = useAuthContext()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-dvh flex flex-col md:flex-row bg-ivory">
      <aside className="md:w-56 border-b md:border-b-0 md:border-r border-border bg-ivory shrink-0">
        <div className="p-4 md:p-6">
          <Link to={basePath}>
            <LogoFull size="sm" />
          </Link>
          <p className="text-xs text-muted mt-3">{title}</p>
        </div>
        <nav className="flex md:flex-col gap-1 px-2 pb-4 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'shrink-0 px-3 py-2 text-sm rounded-sm transition-colors whitespace-nowrap',
                  isActive ? 'bg-dark text-ivory' : 'text-muted hover:text-dark hover:bg-border/40',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-4 md:px-8 py-4 border-b border-border">
          <div className="text-sm">
            <span className="text-muted">Signed in as </span>
            <span className="font-heading">{user?.displayName}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Sign out
          </Button>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
