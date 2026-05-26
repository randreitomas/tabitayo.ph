import { Link } from 'react-router-dom'
import { LogoFull } from '@/components/logo/LogoFull'

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-[#f3ede6]/40">
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-14">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8 text-center md:text-left">
          <div>
            <LogoFull variant="sidebar" horizontal className="justify-center md:justify-start" />
            <p className="text-sm text-muted mt-4 max-w-xs mx-auto md:mx-0 leading-relaxed">
              Calm arrivals for Philippine celebrations — weddings, debuts, and galas.
            </p>
          </div>
          <nav className="flex flex-col sm:flex-row gap-6 sm:gap-10 justify-center md:justify-end text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted mb-2">Product</p>
              <ul className="space-y-2">
                <li>
                  <a href="/#how-it-works" className="text-dark/85 hover:text-dusty-rose">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="/#pricing" className="text-dark/85 hover:text-dusty-rose">
                    Pricing
                  </a>
                </li>
                <li>
                  <Link to="/e/evt-demo" className="text-dark/85 hover:text-dusty-rose">
                    Guest demo
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.12em] text-muted mb-2">Account</p>
              <ul className="space-y-2">
                <li>
                  <Link to="/login" className="text-dark/85 hover:text-dusty-rose">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-dark/85 hover:text-dusty-rose">
                    Register
                  </Link>
                </li>
                <li>
                  <Link to="/business" className="text-dark/85 hover:text-dusty-rose">
                    For planners
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
        <p className="text-xs text-muted text-center md:text-left mt-10 pt-8 border-t border-border/70">
          © {new Date().getFullYear()} Tabitayo. Data privacy aligned with the Philippine Data
          Privacy Act (PDPA).
        </p>
      </div>
    </footer>
  )
}
