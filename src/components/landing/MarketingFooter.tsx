import { Link } from 'react-router-dom'
import { LogoFull } from '@/components/logo/LogoFull'

export function MarketingFooter() {
  return (
    <footer className="border-t border-border py-10 px-4 text-center">
      <LogoFull size="sm" className="mb-4 opacity-80" />
      <p className="text-xs text-muted max-w-md mx-auto">
        © {new Date().getFullYear()} Tabitayo. Data privacy aligned with the Philippine Data
        Privacy Act (PDPA).
      </p>
      <div className="flex justify-center gap-4 mt-4 text-xs">
        <Link to="/login" className="text-muted hover:text-dark underline">
          Sign in
        </Link>
        <Link to="/register" className="text-muted hover:text-dark underline">
          Register
        </Link>
      </div>
    </footer>
  )
}
