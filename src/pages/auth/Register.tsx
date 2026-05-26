import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { LogoFull } from '@/components/logo/LogoFull'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { AuthBackLink } from '@/components/auth/AuthBackLink'
import { getApiErrorMessage } from '@/lib/api/errors'

export function Register() {
  const { register } = useAuthContext()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register({ email, password, displayName })
      navigate('/host/events', { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed. Please try again.'))
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
        <h1 className="font-heading text-2xl mb-2 text-center">Host registration</h1>
        <p className="text-xs text-muted text-center mb-6">
          Create an account to manage your events. Admin approval may be required.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            hint="At least 8 characters (required by the API)"
          />
          {error && <p className="text-xs text-red-600 text-center">{error}</p>}
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
        <p className="text-sm text-center mt-4">
          <Link to="/login" className="underline hover:text-dark">
            Already have an account?
          </Link>
        </p>
      </Card>
    </div>
  )
}
