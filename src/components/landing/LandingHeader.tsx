import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LogoFull } from '@/components/logo/LogoFull'
import { useScrollToSection } from '@/hooks/useScrollToSection'

type NavItem =
  | { kind: 'page'; to: string; label: string }
  | { kind: 'section'; hash: string; label: string }

const NAV_ITEMS: NavItem[] = [
  { kind: 'section', hash: 'home', label: 'Home' },
  { kind: 'section', hash: 'business', label: 'Business' },
  { kind: 'section', hash: 'feedback', label: 'Feedback' },
  { kind: 'section', hash: 'how-it-works', label: 'How it works' },
  { kind: 'section', hash: 'faqs', label: 'FAQs' },
  { kind: 'section', hash: 'pricing', label: 'Pricing' },
]

function HeaderLabel({ children }: { children: ReactNode }) {
  return <span className="relative top-[3px] block text-sm leading-none">{children}</span>
}

const navLinkClass =
  'flex h-16 items-center justify-center px-2.5 m-0 border-0 bg-transparent cursor-pointer text-muted hover:text-dark transition-colors whitespace-nowrap font-body no-underline'

export function LandingHeader() {
  const scrollTo = useScrollToSection()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  const sectionHref = (hash: string) => `/#${hash}`

  const handleSectionNav = (hash: string) => {
    closeMenu()
    if (location.pathname === '/') {
      scrollTo(hash)
    }
  }

  const isActive = (item: NavItem) => {
    if (item.kind === 'page') return location.pathname === item.to
    return location.pathname === '/' && location.hash === `#${item.hash}`
  }

  const navItemClass = (item: NavItem) =>
    [navLinkClass, isActive(item) ? 'text-dark' : ''].filter(Boolean).join(' ')

  return (
    <header
      className={[
        'sticky top-0 z-40 transition-shadow duration-300',
        scrolled
          ? 'bg-ivory/95 backdrop-blur-sm shadow-sm border-b border-border/60'
          : 'bg-ivory/80 backdrop-blur-sm',
      ].join(' ')}
    >
      <div className="max-w-6xl mx-auto px-4 flex h-16 items-center justify-between gap-4 lg:gap-6">
        <Link
          to="/"
          className="flex h-16 items-center shrink-0 no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-dusty-rose rounded-sm"
          aria-label="Tabitayo home"
        >
          <LogoFull horizontal variant="header" />
        </Link>

        <nav
          className="hidden lg:flex flex-1 items-center justify-center h-16 min-w-0"
          aria-label="Main"
        >
          {NAV_ITEMS.map((item) =>
            item.kind === 'page' ? (
              <Link key={item.to} to={item.to} className={navItemClass(item)}>
                <HeaderLabel>{item.label}</HeaderLabel>
              </Link>
            ) : (
              <Link
                key={item.hash}
                to={sectionHref(item.hash)}
                className={navItemClass(item)}
                onClick={(e) => {
                  if (location.pathname === '/') {
                    e.preventDefault()
                    handleSectionNav(item.hash)
                  }
                }}
              >
                <HeaderLabel>{item.label}</HeaderLabel>
              </Link>
            )
          )}
        </nav>

        <div className="hidden lg:flex items-center h-16 shrink-0 gap-4">
          <Link to="/login" className={`${navLinkClass} px-1`}>
            <HeaderLabel>Log in</HeaderLabel>
          </Link>
          <Link to="/register" className="flex h-16 items-center no-underline">
            <span className="inline-flex items-center justify-center px-4 py-[7px] rounded-sm bg-dark text-ivory text-sm font-body leading-none hover:bg-dark/90 transition-colors">
              Get started
            </span>
          </Link>
        </div>

        <div className="flex lg:hidden items-center h-16 gap-2 ml-auto shrink-0">
          <Link to="/login" className={`${navLinkClass} px-1 text-sm`}>
            <HeaderLabel>Log in</HeaderLabel>
          </Link>
          <Link to="/register" className="flex h-16 items-center no-underline">
            <span className="inline-flex items-center justify-center px-3 py-[7px] rounded-sm bg-dark text-ivory text-sm font-body leading-none">
              Get started
            </span>
          </Link>
          <button
            type="button"
            className="flex h-16 w-10 items-center justify-center border-0 bg-transparent cursor-pointer text-dark"
            aria-expanded={menuOpen}
            aria-label="Open menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="relative top-[2px] text-xl leading-none">
              {menuOpen ? '×' : '☰'}
            </span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="lg:hidden border-t border-border bg-ivory px-4 py-3" aria-label="Mobile">
          <ul className="flex flex-col">
            {NAV_ITEMS.map((item) => (
              <li key={item.kind === 'page' ? item.to : item.hash}>
                {item.kind === 'page' ? (
                  <Link
                    to={item.to}
                    className="block w-full text-left py-2.5 text-sm text-dark border-b border-border/50 no-underline"
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <Link
                    to={sectionHref(item.hash)}
                    className="block w-full text-left py-2.5 text-sm text-dark border-b border-border/50 no-underline"
                    onClick={(e) => {
                      if (location.pathname === '/') {
                        e.preventDefault()
                        handleSectionNav(item.hash)
                      } else {
                        closeMenu()
                      }
                    }}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
            <li className="pt-3 flex gap-2">
              <Link
                to="/login"
                className="flex-1 inline-flex items-center justify-center py-2.5 rounded-sm border border-border text-sm font-body no-underline text-dark"
                onClick={closeMenu}
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="flex-1 inline-flex items-center justify-center py-2.5 rounded-sm bg-dark text-ivory text-sm font-body leading-none no-underline"
                onClick={closeMenu}
              >
                Get started
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
