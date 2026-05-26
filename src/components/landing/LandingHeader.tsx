import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { LogoFull } from '@/components/logo/LogoFull'
import { useScrollToSection } from '@/hooks/useScrollToSection'

const NAV_ITEMS = [
  { id: 'home', label: 'Home' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'how-it-works-guest', label: 'How it works (Guest)' },
  { id: 'how-it-works-host', label: 'How it works (Host)' },
  { id: 'faqs', label: 'FAQs' },
  { id: 'pricing', label: 'Pricing' },
] as const

/** Libre Baskerville sits optically high at line-height 1 — nudge label down in the header */
function HeaderLabel({ children }: { children: ReactNode }) {
  return <span className="relative top-[3px] block text-sm leading-none">{children}</span>
}

const navButtonClass =
  'flex h-16 items-center justify-center px-2.5 m-0 border-0 bg-transparent cursor-pointer text-muted hover:text-dark transition-colors whitespace-nowrap font-body'

export function LandingHeader() {
  const scrollTo = useScrollToSection()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNav = (id: string) => {
    scrollTo(id)
    setMenuOpen(false)
  }

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
        <button
          type="button"
          onClick={() => handleNav('home')}
          className="flex h-16 items-center shrink-0 border-0 bg-transparent p-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-dusty-rose rounded-sm"
          aria-label="Tabitayo home"
        >
          <LogoFull horizontal variant="header" />
        </button>

        <nav
          className="hidden lg:flex flex-1 items-center justify-center h-16 min-w-0"
          aria-label="Main"
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNav(item.id)}
              className={navButtonClass}
            >
              <HeaderLabel>{item.label}</HeaderLabel>
            </button>
          ))}
        </nav>

        <div className="hidden lg:flex items-center h-16 shrink-0 gap-4">
          <Link
            to="/login"
            className={`${navButtonClass} no-underline px-1`}
          >
            <HeaderLabel>Log in</HeaderLabel>
          </Link>
          <Link
            to="/register"
            className="flex h-16 items-center no-underline"
          >
            <span className="inline-flex items-center justify-center px-4 py-[7px] rounded-sm bg-dark text-ivory text-sm font-body leading-none hover:bg-dark/90 transition-colors">
              Get started
            </span>
          </Link>
        </div>

        <div className="flex lg:hidden items-center h-16 gap-2 ml-auto shrink-0">
          <Link to="/login" className={`${navButtonClass} no-underline px-1 text-sm`}>
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
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleNav(item.id)}
                  className="w-full text-left py-2.5 text-sm text-dark border-b border-border/50"
                >
                  {item.label}
                </button>
              </li>
            ))}
            <li className="pt-3 flex gap-2">
              <Link
                to="/login"
                className="flex-1 inline-flex items-center justify-center py-2.5 rounded-sm border border-border text-sm font-body no-underline text-dark"
                onClick={() => setMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="flex-1 inline-flex items-center justify-center py-2.5 rounded-sm bg-dark text-ivory text-sm font-body leading-none no-underline"
                onClick={() => setMenuOpen(false)}
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
