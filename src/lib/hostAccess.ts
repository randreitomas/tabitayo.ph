import type { User } from '@/types/user'

export function getPostAuthPath(user: User, fromPath?: string): string {
  if (fromPath && fromPath !== '/login' && fromPath !== '/register') {
    return fromPath
  }
  if (user.role === 'admin') return '/admin/hosts'
  if (user.hostStatus === 'pending') return '/host/pending'
  if (user.hostStatus === 'disabled') return '/login'
  return '/host/events'
}

export function isHostPending(user: User | null): boolean {
  return user?.role === 'host' && user.hostStatus === 'pending'
}

export function isHostActive(user: User | null): boolean {
  return user?.role === 'host' && user.hostStatus === 'active'
}
