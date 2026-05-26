import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { LogoFull } from '@/components/logo/LogoFull'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { AuthBackLink } from '@/components/auth/AuthBackLink'
import { getApiErrorMessage } from '@/lib/api/errors'

export function Login() {
  const { login, user } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    const dest = user.role === 'admin' ? '/admin/hosts' : '/host/events'
    navigate(dest, { replace: true })
  }, [user, navigate])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const loggedIn = await login({ email, password })
      const dest =
        from ??
        (loggedIn.role === 'admin' ? '/admin/hosts' : '/host/events')
      navigate(dest, { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid email or password'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh relative flex flex-col items-center justify-center px-4 py-12 bg-ivory">
      <div className="absolute top-4 left-4 md:top-6 md:left-6">
        <AuthBackLink />
      </div>
      <LogoFull size="lg" className="mb-10" />
      <Card className="w-full max-w-md">
        <h1 className="font-heading text-2xl mb-6 text-center">Sign in</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && <p className="text-xs text-red-600 text-center">{error}</p>}
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
        <p className="text-xs text-muted text-center mt-6">
          Demo: maria@example.com or admin@tabitayo.ph (any password)
        </p>
        <p className="text-sm text-center mt-4">
          <Link to="/register" className="underline hover:text-dark">
            Register as host
          </Link>
        </p>
      </Card>
    </div>
  )
}
