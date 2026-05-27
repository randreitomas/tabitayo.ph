import type { Event, CreateEventInput, PhotoShareItem, QrCodeInfo } from '@/types/event'
import type {
  Guest,
  CreateGuestInput,
  PublicGuestLookupPayload,
  PublicGuestLookupResult,
} from '@/types/guest'
import type { HostAccount, LoginInput, RegisterInput, User } from '@/types/user'
import type { ActivityLog, ActivityLogFilters } from '@/types/activityLog'
import { apiClient } from './client'
import { getApiErrorMessage, isApiNotFound } from './errors'
import type {
  ApiAuthResponse,
  ApiEvent,
  ApiMenuAssetRead,
  ApiPaymentSubmission,
  ApiQrCode,
} from './dto'
import {
  guestFromSearchResult,
  mapAuthResponse,
  mapEvent,
  mapGuest,
  mapGuestLookupResult,
  mapHostAccount,
  mapMenuAssetRead,
  mapPublicEvent,
  mapQrCode,
  mapSeatConfirm,
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

async function refetchHostEvent(eventId: string): Promise<Event> {
  const event = await backendGetHostEvent(eventId)
  if (!event) throw new Error('Event not found')
  return event
}

/** Let axios set multipart boundary — do not set Content-Type manually. */
async function uploadMultipart(eventId: string, path: string, file: File): Promise<void> {
  const form = new FormData()
  form.append('file', file)
  await apiClient.post(`/host/events/${encodeURIComponent(eventId)}${path}`, form, {
    headers: { 'Content-Type': undefined },
    validateStatus: (s) => s >= 200 && s < 300,
  })
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
    { validateStatus: (s) => s >= 200 && s < 300 }
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
  /* No logout endpoint */
}

// ——— Public (no auth) ———

export async function backendGetPublicEvent(lookupToken: string): Promise<Event | null> {
  try {
    const { data } = await apiClient.get(
      `/public/events/${encodeURIComponent(lookupToken)}`
    )
    return mapPublicEvent(data, lookupToken)
  } catch (err) {
    if (isApiNotFound(err)) return null
    throw new Error(getApiErrorMessage(err, 'Failed to load event'))
  }
}

export async function backendPublicGuestLookup(
  lookupToken: string,
  payload: PublicGuestLookupPayload
): Promise<PublicGuestLookupResult | null> {
  try {
    const { data } = await apiClient.post(
      `/public/events/${encodeURIComponent(lookupToken)}/guest-lookup`,
      payload
    )
    return mapGuestLookupResult(data)
  } catch (err) {
    if (isApiNotFound(err)) return null
    throw new Error(getApiErrorMessage(err, 'Could not find your seat. Check your details.'))
  }
}

/** Legacy GET search — fallback */
export async function backendSearchPublicGuestLegacy(
  lookupToken: string,
  name: string
): Promise<PublicGuestLookupResult | null> {
  try {
    const { data } = await apiClient.get(
      `/public/events/${encodeURIComponent(lookupToken)}/guests/search`,
      { params: { name: name.trim() } }
    )
    return mapGuestLookupResult(data)
  } catch (err) {
    if (isApiNotFound(err)) return null
    throw new Error(getApiErrorMessage(err, 'Search failed'))
  }
}

export async function backendConfirmSeatFound(
  lookupToken: string,
  guestId: string
): Promise<PublicGuestLookupResult> {
  const { data } = await apiClient.patch(
    `/public/events/${encodeURIComponent(lookupToken)}/guests/${encodeURIComponent(guestId)}/seat-found`
  )
  return mapSeatConfirm(data)
}

// ——— Host events ———

export async function backendGetHostEvents(): Promise<Event[]> {
  const { data } = await apiClient.get('/host/events', { params: { limit: 50, offset: 0 } })
  return unwrapList<ApiEvent>(data).map(mapEvent)
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
  const { data } = await apiClient.post<ApiEvent>('/host/events', toCreateEventBody(input), {
    validateStatus: (s) => s >= 200 && s < 300,
  })
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

// ——— Host assets ———

export async function backendUploadFloorPlan(eventId: string, file: File): Promise<Event> {
  await uploadMultipart(eventId, '/floor-plan', file)
  return refetchHostEvent(eventId)
}

export async function backendDeleteFloorPlan(eventId: string): Promise<Event> {
  await apiClient.delete(`/host/events/${encodeURIComponent(eventId)}/floor-plan`)
  return refetchHostEvent(eventId)
}

export async function backendUploadMenu(eventId: string, file: File): Promise<Event> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await apiClient.post<ApiMenuAssetRead>(
    `/host/events/${encodeURIComponent(eventId)}/menu`,
    form,
    {
      headers: { 'Content-Type': undefined },
      validateStatus: (s) => s >= 200 && s < 300,
    }
  )
  const menuFields = mapMenuAssetRead(data)
  const base = await refetchHostEvent(eventId)
  return { ...base, ...menuFields }
}

export async function backendDeleteMenu(eventId: string): Promise<Event> {
  await apiClient.delete(`/host/events/${encodeURIComponent(eventId)}/menu`)
  return refetchHostEvent(eventId)
}

export async function backendSetSpotifyPlaylist(
  eventId: string,
  spotifyPlaylistUrl: string
): Promise<Event> {
  await apiClient.post(
    `/host/events/${encodeURIComponent(eventId)}/spotify-playlist`,
    { spotify_playlist_url: spotifyPlaylistUrl }
  )
  return refetchHostEvent(eventId)
}

export async function backendDeleteSpotifyPlaylist(eventId: string): Promise<Event> {
  await apiClient.delete(`/host/events/${encodeURIComponent(eventId)}/spotify-playlist`)
  return refetchHostEvent(eventId)
}

export async function backendGetOrCreateQrCode(eventId: string): Promise<QrCodeInfo> {
  try {
    const { data } = await apiClient.get<ApiQrCode>(
      `/host/events/${encodeURIComponent(eventId)}/qr-code`
    )
    return mapQrCode(data)
  } catch (err) {
    if (!isApiNotFound(err)) throw err
    const { data } = await apiClient.post<ApiQrCode>(
      `/host/events/${encodeURIComponent(eventId)}/qr-code`
    )
    return mapQrCode(data)
  }
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
    toCreateGuestBody(input),
    { validateStatus: (s) => s >= 200 && s < 300 }
  )
  return mapGuest(data)
}

export async function backendUploadGuestsCsv(eventId: string, file: File): Promise<Guest[]> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await apiClient.post(
    `/host/events/${encodeURIComponent(eventId)}/guests/upload-csv`,
    form,
    {
      headers: { 'Content-Type': undefined },
      validateStatus: (s) => s >= 200 && s < 300,
    }
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
  const { data } = await apiClient.get('/admin/users', { params: { role: 'host', limit: 50 } })
  const users = unwrapList<import('./dto').ApiUser>(data)
  const hosts = users.filter((u) => u.role === 'host')
  const events = await backendGetAdminEvents()
  const countByHost = new Map<string, number>()
  for (const e of events) {
    countByHost.set(e.hostId, (countByHost.get(e.hostId) ?? 0) + 1)
  }
  return hosts.map((h) => mapHostAccount(h, countByHost.get(h.id) ?? 0))
}

export async function backendGetAdminEvents(): Promise<Event[]> {
  const { data } = await apiClient.get('/admin/events', { params: { limit: 50, offset: 0 } })
  return unwrapList<ApiEvent>(data).map(mapEvent)
}

async function backendListPaymentSubmissions(): Promise<ApiPaymentSubmission[]> {
  const { data } = await apiClient.get('/admin/payment-submissions')
  return unwrapList<ApiPaymentSubmission>(data)
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

export async function backendSubmitEventPayment(eventId: string): Promise<Event> {
  return backendUpdateEvent(eventId, { approvalStatus: 'payment_submitted' })
}

export async function backendGetActivityLogs(
  _filters?: ActivityLogFilters
): Promise<ActivityLog[]> {
  return []
}

export async function backendGetApprovedPhotos(_eventId?: string): Promise<PhotoShareItem[]> {
  return []
}

export async function backendUploadGuestPhoto(): Promise<PhotoShareItem> {
  throw new Error('Photo share is not available on the API yet.')
}

export async function backendGetEventPhotos(_eventId?: string): Promise<PhotoShareItem[]> {
  return []
}

export async function backendUpdatePhotoStatus(
  _photoId?: string,
  _status?: PhotoShareItem['status']
): Promise<PhotoShareItem> {
  throw new Error('Photo share is not available on the API yet.')
}

// Re-export for legacy search typing
export { guestFromSearchResult }
