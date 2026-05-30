import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { isHostActive } from '@/lib/hostAccess'
import { LogoFull } from '@/components/logo/LogoFull'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const STATUS_POLL_MS = 15_000

export function HostPendingApproval() {
  const { user, logout, refresh } = useAuthContext()
  const navigate = useNavigate()
  const [checking, setChecking] = useState(false)

  const checkApproval = useCallback(async () => {
    setChecking(true)
    try {
      await refresh()
    } finally {
      setChecking(false)
    }
  }, [refresh])

  useEffect(() => {
    if (user && isHostActive(user)) {
      navigate('/host/events', { replace: true })
    }
  }, [user, navigate])

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') void checkApproval()
    }
    document.addEventListener('visibilitychange', onVisible)
    const interval = window.setInterval(() => void checkApproval(), STATUS_POLL_MS)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.clearInterval(interval)
    }
  }, [checkApproval])

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-12 bg-ivory">
      <LogoFull size="lg" className="mb-8" />
      <Card className="w-full max-w-md text-center space-y-4">
        <h1 className="font-heading text-2xl">Account pending approval</h1>
        <p className="text-sm text-muted leading-relaxed">
          Thanks for registering{user?.displayName ? `, ${user.displayName}` : ''}. A Tabitayo
          admin will review your host account before you can create events and manage guests.
        </p>
        <p className="text-xs text-muted">
          This page updates automatically when you are approved. You can also check manually
          below.
        </p>
        <p className="text-xs text-muted">
          Signed in as <span className="text-dark">{user?.email}</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button variant="accent" disabled={checking} onClick={() => void checkApproval()}>
            {checking ? 'Checking...' : 'Check approval status'}
          </Button>
          <Button variant="secondary" onClick={() => void logout()}>
            Sign out
          </Button>
        </div>
      </Card>
    </div>
  )
}
