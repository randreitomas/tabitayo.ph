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
      <aside className="md:w-64 border-b md:border-b-0 md:border-r border-border bg-[#f3ede6] shrink-0">
        <div className="p-5 md:p-6 md:pb-4">
          <Link to={basePath} className="inline-block">
            <LogoFull variant="sidebar" horizontal />
          </Link>
          <p className="mt-4 text-[11px] font-body uppercase tracking-[0.14em] text-muted">
            {title}
          </p>
        </div>
        <nav
          className="flex md:flex-col gap-0.5 px-3 pb-5 overflow-x-auto"
          aria-label="Dashboard navigation"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'shrink-0 px-3 py-2.5 text-sm font-body rounded-sm transition-colors whitespace-nowrap',
                  'border-l-[3px]',
                  isActive
                    ? 'border-dusty-rose bg-dusty-rose/25 text-dark font-medium'
                    : 'border-transparent text-muted hover:text-dark hover:bg-ivory/70',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between gap-4 px-4 md:px-8 py-4 border-b border-border bg-ivory/95">
          <div className="min-w-0">
            <p className="text-sm text-muted leading-none">Signed in as</p>
            <p className="font-heading text-lg md:text-xl text-dark truncate mt-1 leading-tight">
              {user?.displayName ?? '—'}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-sm shrink-0">
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
