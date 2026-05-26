import type { Event, CreateEventInput, PhotoShareItem } from '@/types/event'
import type { Guest, CreateGuestInput } from '@/types/guest'
import type { HostAccount, LoginInput, RegisterInput, User } from '@/types/user'
import type { ActivityLog, ActivityLogFilters } from '@/types/activityLog'
import { apiClient } from './client'
import { getApiErrorMessage, isApiNotFound } from './errors'
import type { ApiAuthResponse, ApiEvent, ApiGuestSearchResult, ApiPaymentSubmission } from './dto'
import {
  guestFromSearchResult,
  mapAuthResponse,
  mapEvent,
  mapGuest,
  mapHostAccount,
  mapPublicEvent,
  mapUser,
  toCreateEventBody,
  toCreateGuestBody,
  toEventPatch,
  unwrapGuestList,
} from './mappers'

function unwrapList<T>(data: unknown, key?: string): T[] {
  if (Array.isArray(data)) return data as T[]
  if (key && data && typeof data === 'object' && key in data) {
    const arr = (data as Record<string, unknown>)[key]
    if (Array.isArray(arr)) return arr as T[]
  }
  const obj = data as { items?: T[] }
  return obj.items ?? []
}

// ——— Auth ———

export async function backendLogin(input: LoginInput) {
  const { data } = await apiClient.post<ApiAuthResponse>('/auth/login', {
    email: input.email,
    password: input.password,
  })
  return mapAuthResponse(data)
}

export async function backendRegister(input: RegisterInput) {
  const { data } = await apiClient.post<ApiAuthResponse>(
    '/auth/register',
    {
      email: input.email,
      password: input.password,
      display_name: input.displayName,
    },
    { validateStatus: (status) => status >= 200 && status < 300 }
  )
  return mapAuthResponse(data)
}

export async function backendGetCurrentUser(): Promise<User | null> {
  try {
    const { data } = await apiClient.get('/auth/me')
    return mapUser(data)
  } catch (err) {
    if (isApiNotFound(err)) return null
    throw err
  }
}

export async function backendRecordLogout(): Promise<void> {
  /* No logout endpoint in MVP contract */
}

// ——— Public ———

export async function backendGetPublicEvent(publicSlug: string): Promise<Event | null> {
  try {
    const { data } = await apiClient.get(`/public/events/${encodeURIComponent(publicSlug)}`)
    return mapPublicEvent(data, publicSlug)
  } catch (err) {
    if (isApiNotFound(err)) return null
    throw new Error(getApiErrorMessage(err, 'Failed to load event'))
  }
}

export async function backendSearchPublicGuest(
  publicSlug: string,
  name: string
): Promise<{ event: Event; guest: Guest } | null> {
  try {
    const { data } = await apiClient.get<ApiGuestSearchResult>(
      `/public/events/${encodeURIComponent(publicSlug)}/guests/search`,
      { params: { name: name.trim() } }
    )
    const event = mapPublicEvent(data, publicSlug)
    const guest = guestFromSearchResult(data, publicSlug)
    return { event, guest }
  } catch (err) {
    if (isApiNotFound(err)) return null
    throw new Error(getApiErrorMessage(err, 'Search failed'))
  }
}

// ——— Host events ———

export async function backendGetHostEvents(): Promise<Event[]> {
  const { data } = await apiClient.get('/host/events')
  return unwrapList<ApiEvent>(data, 'events').map(mapEvent)
}

export async function backendGetHostEvent(eventId: string): Promise<Event | null> {
  try {
    const { data } = await apiClient.get<ApiEvent>(
      `/host/events/${encodeURIComponent(eventId)}`
    )
    return mapEvent(data)
  } catch (err) {
    if (isApiNotFound(err)) return null
    throw err
  }
}

export async function backendCreateEvent(input: CreateEventInput): Promise<Event> {
  const { data } = await apiClient.post<ApiEvent>('/host/events', toCreateEventBody(input))
  return mapEvent(data)
}

export async function backendUpdateEvent(eventId: string, patch: Partial<Event>): Promise<Event> {
  const { data } = await apiClient.patch<ApiEvent>(
    `/host/events/${encodeURIComponent(eventId)}`,
    toEventPatch(patch)
  )
  return mapEvent(data)
}

export async function backendDeleteEvent(eventId: string): Promise<void> {
  await apiClient.delete(`/host/events/${encodeURIComponent(eventId)}`)
}

// ——— Host guests ———

export async function backendGetEventGuests(eventId: string): Promise<Guest[]> {
  const { data } = await apiClient.get(
    `/host/events/${encodeURIComponent(eventId)}/guests`,
    { params: { limit: 500, offset: 0 } }
  )
  return unwrapGuestList(data).map(mapGuest)
}

export async function backendAddGuest(eventId: string, input: CreateGuestInput): Promise<Guest> {
  const { data } = await apiClient.post(
    `/host/events/${encodeURIComponent(eventId)}/guests`,
    toCreateGuestBody(input)
  )
  return mapGuest(data)
}

export async function backendUploadGuestsCsv(eventId: string, file: File): Promise<Guest[]> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await apiClient.post(
    `/host/events/${encodeURIComponent(eventId)}/guests/upload-csv`,
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  const guests = (data as { guests?: unknown }).guests
  return unwrapGuestList(guests ?? data).map(mapGuest)
}

export async function backendDeleteGuest(eventId: string, guestId: string): Promise<void> {
  await apiClient.delete(
    `/host/events/${encodeURIComponent(eventId)}/guests/${encodeURIComponent(guestId)}`
  )
}

// ——— Admin ———

export async function backendGetAdminUsers(): Promise<HostAccount[]> {
  const { data } = await apiClient.get('/admin/users')
  const users = unwrapList<import('./dto').ApiUser>(data, 'users')
  const hosts = users.filter((u) => u.role === 'host')
  const events = await backendGetAdminEvents()
  const countByHost = new Map<string, number>()
  for (const e of events) {
    countByHost.set(e.hostId, (countByHost.get(e.hostId) ?? 0) + 1)
  }
  return hosts.map((h) => mapHostAccount(h, countByHost.get(h.id) ?? 0))
}

export async function backendGetAdminEvents(): Promise<Event[]> {
  const { data } = await apiClient.get('/admin/events')
  return unwrapList<ApiEvent>(data, 'events').map(mapEvent)
}

async function backendListPaymentSubmissions(): Promise<ApiPaymentSubmission[]> {
  const { data } = await apiClient.get('/admin/payment-submissions')
  return unwrapList<ApiPaymentSubmission>(data, 'payment_submissions')
}

export async function backendApproveEvent(eventId: string): Promise<Event> {
  const submissions = await backendListPaymentSubmissions()
  const submission = submissions.find(
    (s) => s.event_id === eventId && s.status !== 'approved' && s.status !== 'rejected'
  )
  if (!submission) {
    throw new Error('No payment submission found for this event.')
  }
  await apiClient.patch(
    `/admin/payment-submissions/${encodeURIComponent(submission.id)}/review`,
    { status: 'approved', admin_notes: 'Payment confirmed' }
  )
  const { data } = await apiClient.get<ApiEvent>(
    `/admin/events/${encodeURIComponent(eventId)}`
  )
  return mapEvent(data)
}

export async function backendRejectEvent(eventId: string, reason?: string): Promise<Event> {
  const submissions = await backendListPaymentSubmissions()
  const submission = submissions.find(
    (s) => s.event_id === eventId && s.status !== 'approved' && s.status !== 'rejected'
  )
  if (!submission) {
    throw new Error('No payment submission found for this event.')
  }
  await apiClient.patch(
    `/admin/payment-submissions/${encodeURIComponent(submission.id)}/review`,
    {
      status: 'rejected',
      admin_notes: reason?.trim() || 'Payment could not be verified',
    }
  )
  const { data } = await apiClient.get<ApiEvent>(
    `/admin/events/${encodeURIComponent(eventId)}`
  )
  return mapEvent(data)
}

export async function backendUpdateHostStatus(
  _hostId: string,
  _status: HostAccount['status']
): Promise<HostAccount> {
  throw new Error('Host account status changes are not supported by the API yet.')
}

// ——— Not in MVP contract (stubs) ———

export async function backendSubmitEventPayment(eventId: string): Promise<Event> {
  return backendUpdateEvent(eventId, {
    approvalStatus: 'payment_submitted',
    paymentSubmittedAt: new Date().toISOString(),
  } as Partial<Event>)
}

export async function backendGetActivityLogs(
  _filters: ActivityLogFilters = {}
): Promise<ActivityLog[]> {
  return []
}

export async function backendGetApprovedPhotos(_eventId: string): Promise<PhotoShareItem[]> {
  return []
}

export async function backendUploadGuestPhoto(): Promise<PhotoShareItem> {
  throw new Error('Photo share is not available on the API yet.')
}

export async function backendGetEventPhotos(_eventId: string): Promise<PhotoShareItem[]> {
  return []
}

export async function backendUpdatePhotoStatus(): Promise<PhotoShareItem> {
  throw new Error('Photo share is not available on the API yet.')
}
