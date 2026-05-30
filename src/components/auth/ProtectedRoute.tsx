import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { isHostPending } from '@/lib/hostAccess'
import type { UserRole } from '@/types/user'

interface ProtectedRouteProps {
  children: React.ReactNode
  role?: UserRole
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, loading } = useAuthContext()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-ivory">
        <p className="text-muted font-heading text-xl">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (role && user.role !== role) {
    const redirect = user.role === 'admin' ? '/admin/hosts' : '/host/events'
    return <Navigate to={redirect} replace />
  }

  if (role === 'host' && isHostPending(user)) {
    const onPendingPage = location.pathname.startsWith('/host/pending')
    if (!onPendingPage) {
      return <Navigate to="/host/pending" replace />
    }
  }

  if (role === 'host' && user.hostStatus === 'disabled') {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
