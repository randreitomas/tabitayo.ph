import { useAuthContext } from '@/contexts/AuthContext'
import { LogoFull } from '@/components/logo/LogoFull'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function HostPendingApproval() {
  const { user, logout } = useAuthContext()

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
          You can sign out and return later — we will email you at{' '}
          <span className="text-dark">{user?.email}</span> when your account is ready.
        </p>
        <Button variant="secondary" onClick={() => void logout()} className="mx-auto">
          Sign out
        </Button>
      </Card>
    </div>
  )
}
