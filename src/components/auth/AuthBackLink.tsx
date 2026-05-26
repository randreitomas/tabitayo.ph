import { Link } from 'react-router-dom'

export function AuthBackLink() {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-dark transition-colors"
    >
      <span aria-hidden>←</span>
      Back to home
    </Link>
  )
}
