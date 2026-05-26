export type ActivityAction = 'login' | 'logout' | 'add_event' | 'configure_event'

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
}

export interface ActivityLogFilters {
  action?: ActivityAction | 'all'
  fromDate?: string
  toDate?: string
}

export const ACTIVITY_ACTION_LABELS: Record<ActivityAction, string> = {
  login: 'Login',
  logout: 'Logout',
  add_event: 'Add event',
  configure_event: 'Configure event',
}
