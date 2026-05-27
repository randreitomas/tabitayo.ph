import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LogoFull } from '@/components/logo/LogoFull'
import { LogoMark } from '@/components/logo/LogoMark'
import { useAuthContext } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { lockDocumentScroll, unlockDocumentScroll } from '@/lib/scrollLock'

const SIDEBAR_STORAGE_KEY = 'tabitayo-dashboard-sidebar-collapsed'

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

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      {direction === 'left' ? (
        <path d="M15 18l-6-6 6-6" />
      ) : (
        <path d="M9 18l6-6-6-6" />
      )}
    </svg>
  )
}

function readCollapsedPreference(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function DashboardLayout({ basePath, navItems, title }: DashboardLayoutProps) {
  const { user, logout } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(readCollapsedPreference)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed))
    } catch {
      /* ignore */
    }
  }, [collapsed])

  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    lockDocumentScroll()
    return () => unlockDocumentScroll()
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const toggleCollapsed = () => setCollapsed((v) => !v)

  const navLinkClass = (isActive: boolean, compact: boolean) =>
    [
      'flex items-center rounded-sm transition-colors font-body',
      compact ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5 text-sm border-l-[3px]',
      isActive
        ? compact
          ? 'text-dark'
          : 'border-dusty-rose text-dark font-medium'
        : compact
          ? 'text-muted hover:text-dark'
          : 'border-transparent text-muted hover:text-dark hover:bg-black/[0.03]',
    ].join(' ')

  const compactNavLetterClass = (isActive: boolean) =>
    [
      'w-9 h-9 rounded-sm flex items-center justify-center text-xs font-medium bg-transparent',
      isActive
        ? 'border-2 border-dusty-rose text-dark font-semibold'
        : 'border border-transparent text-muted',
    ].join(' ')

  const sidebarNav = (compact: boolean) => (
    <nav className="flex flex-col gap-1 px-2 py-2" aria-label="Dashboard navigation">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          title={compact ? item.label : undefined}
          className={({ isActive }) => navLinkClass(isActive, compact)}
        >
          {({ isActive }) =>
            compact ? (
              <span className={compactNavLetterClass(isActive)}>{item.label.charAt(0)}</span>
            ) : (
              item.label
            )
          }
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="fixed inset-0 z-0 flex h-svh max-h-svh overflow-hidden bg-ivory">
      {/* Desktop sidebar — fixed height; does not scroll with main content */}
      <aside
        className={[
          'hidden md:flex flex-col shrink-0 h-full border-r border-border bg-[#f3ede6] transition-[width] duration-300 ease-out',
          collapsed ? 'w-[4.75rem]' : 'w-60',
        ].join(' ')}
      >
        {collapsed ? (
          <div className="flex flex-col items-center gap-3 py-4 px-2 border-b border-border/60">
            <Link to={basePath} className="inline-flex justify-center" title="Tabitayo home">
              <LogoMark className="h-9 w-9" />
            </Link>
            <button
              type="button"
              onClick={toggleCollapsed}
              className="flex items-center justify-center w-9 h-9 rounded-sm text-muted hover:text-dark hover:bg-ivory/80 transition-colors"
              aria-label="Expand sidebar"
              aria-expanded={false}
            >
              <ChevronIcon direction="right" />
            </button>
          </div>
        ) : (
          <div className="px-5 pt-6 pb-5 border-b border-border/60">
            <div className="flex items-start justify-between gap-3">
              <Link to={basePath} className="inline-flex min-w-0 pt-0.5" title="Tabitayo home">
                <LogoFull variant="sidebar" horizontal />
              </Link>
              <button
                type="button"
                onClick={toggleCollapsed}
                className="flex items-center justify-center w-8 h-8 shrink-0 rounded-sm text-muted hover:text-dark hover:bg-ivory/80 transition-colors"
                aria-label="Collapse sidebar"
                aria-expanded
              >
                <ChevronIcon direction="left" />
              </button>
            </div>
            <p className="mt-5 text-[11px] font-body uppercase tracking-[0.14em] text-muted leading-relaxed">
              {title}
            </p>
          </div>
        )}

        <div className={['flex-1 min-h-0 overflow-y-auto', collapsed ? '' : 'pt-2'].join(' ')}>
          {sidebarNav(collapsed)}
        </div>
      </aside>

      {/* Mobile nav overlay */}
      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-dark/40 md:hidden"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-border bg-[#f3ede6] md:hidden transition-transform duration-300',
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <div className="px-5 pt-6 pb-5 border-b border-border/60">
          <Link to={basePath} onClick={() => setMobileNavOpen(false)}>
            <LogoFull variant="sidebar" horizontal />
          </Link>
          <p className="mt-5 text-[11px] font-body uppercase tracking-[0.14em] text-muted leading-relaxed">
            {title}
          </p>
        </div>
        {sidebarNav(false)}
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between gap-4 px-4 md:px-8 lg:px-10 py-4 border-b border-border bg-ivory/95 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-sm border border-border text-dark hover:bg-border/30"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileNavOpen}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="md:hidden shrink-0">
              <LogoMark className="h-8 w-8" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted leading-none">Signed in as</p>
              <p className="font-heading text-lg md:text-xl text-dark truncate mt-0.5 leading-tight">
                {user?.displayName ?? '—'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-sm shrink-0">
            Sign out
          </Button>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain bg-ivory p-5 md:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
