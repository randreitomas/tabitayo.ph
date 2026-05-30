import type { ActivityLog } from '@/types/activityLog'
import type { User } from '@/types/user'
import type { Event } from '@/types/event'

export function buildLogFromUser(
  user: User,
  action: ActivityLog['action'],
  message: string,
  event?: Pick<Event, 'id' | 'name'>
): Omit<ActivityLog, 'id' | 'occurredAt'> {
  return {
    action,
    actorId: user.id,
    actorEmail: user.email,
    actorName: user.displayName,
    actorRole: user.role,
    message,
    eventId: event?.id,
    eventName: event?.name,
  }
}

export function describeEventPatch(patch: Partial<Event>): string {
  const labels: Record<string, string> = {
    name: 'event name',
    date: 'date',
    venue: 'venue',
    tier: 'tier',
    status: 'status',
    floorPlanUrl: 'floor plan',
    menu: 'menu',
    spotifyUrl: 'playlist',
    photoShareEnabled: 'photo share',
    customBranding: 'branding',
  }
  const keys = Object.keys(patch).filter((k) => patch[k as keyof Event] !== undefined)
  if (keys.length === 0) return 'event settings'
  return keys.map((k) => labels[k] ?? k).join(', ')
}

export function loginMessage(user: User): string {
  return `${user.displayName} signed in`
}

export function logoutMessage(user: User): string {
  return `${user.displayName} signed out`
}

export function addEventMessage(user: User, eventName: string): string {
  return `${user.displayName} created event ${eventName} (pending payment & admin approval)`
}

export function configureEventMessage(
  user: User,
  eventName: string,
  patch: Partial<Event>
): string {
  const fields = describeEventPatch(patch)
  return `${user.displayName} updated ${fields} for ${eventName}`
}

const ACTION_BADGE_VARIANT_MAP: Record<string, 'active' | 'ended' | 'pending' | 'default'> = {
  login: 'active',
  logout: 'ended',
  add_event: 'pending',
  configure_event: 'default',
  'host.account.registered': 'pending',
  'admin.host.approved': 'active',
  'admin.host.disabled': 'ended',
  'admin.host.status_changed': 'default',
}

export function getActionBadgeVariant(
  action: string
): 'active' | 'ended' | 'pending' | 'default' {
  return ACTION_BADGE_VARIANT_MAP[action] ?? 'default'
}
