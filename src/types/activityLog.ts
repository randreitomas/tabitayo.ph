export type ActivityAction = string

export interface ActivityLog {
  id: string
  action: ActivityAction
  occurredAt: string
  actorId: string
  actorEmail: string
  actorName: string
  actorRole: 'admin' | 'host'
  message: string
  eventId?: string
  eventName?: string
  targetType?: string
  targetId?: string
}

export interface ActivityLogFilters {
  action?: ActivityAction | 'all'
  fromDate?: string
  toDate?: string
  actorUserId?: string
  eventId?: string
  targetType?: string
  targetId?: string
  limit?: number
  offset?: number
}

/** Legacy mock-only actions */
export const LEGACY_ACTIVITY_ACTION_LABELS: Record<string, string> = {
  login: 'Login',
  logout: 'Logout',
  add_event: 'Add event',
  configure_event: 'Configure event',
}

export const HOST_APPROVAL_ACTION_LABELS: Record<string, string> = {
  'host.account.registered': 'Host registered',
  'admin.host.approved': 'Host approved',
  'admin.host.disabled': 'Host disabled',
  'admin.host.status_changed': 'Host status changed',
}

export function formatActivityAction(action: string): string {
  return (
    HOST_APPROVAL_ACTION_LABELS[action] ??
    LEGACY_ACTIVITY_ACTION_LABELS[action] ??
    action.replace(/\./g, ' · ')
  )
}
