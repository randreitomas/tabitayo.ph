import type { Event, CreateEventInput, PhotoShareItem, QrCodeInfo } from '@/types/event'
import { USE_MOCK } from '@/lib/api/config'
import * as backend from '@/lib/api/backend'
import { getApiErrorMessage } from '@/lib/api/errors'
import type {
  Guest,
  CreateGuestInput,
  GuestNameSuggestion,
  PublicGuestLookupPayload,
  PublicGuestLookupResult,
} from '@/types/guest'
import {
  filterGuestsForSuggestions,
  findGuestForNameLookup,
} from '@/lib/guestNameSearch'
import { normalizeGuestCsvForUpload, parseGuestCsvFile } from '@/lib/guestCsv'
import { guestFromLookupResult } from '@/lib/api/mappers'
import type {
  AuthResponse,
  HostAccount,
  LoginInput,
  RegisterInput,
  User,
} from '@/types/user'
import type { ActivityLog, ActivityLogFilters } from '@/types/activityLog'
import {
  MOCK_ADMIN,
  MOCK_ACTIVITY_LOGS,
  MOCK_EVENTS,
  MOCK_GUESTS,
  MOCK_HOST,
  MOCK_HOSTS,
  MOCK_PHOTOS,
} from './mockData'
import {
  addEventMessage,
  buildLogFromUser,
  configureEventMessage,
  loginMessage,
  logoutMessage,
} from './activityLog'
import { readImageAsDataUrl, isUploadableImage } from './fileUpload'
import { isEventGuestLive } from './eventApproval'

export { USE_MOCK } from '@/lib/api/config'

// In-memory mock stores
let events = [...MOCK_EVENTS]
let guests = [...MOCK_GUESTS]
let photos = [...MOCK_PHOTOS]
let hosts = [...MOCK_HOSTS]
let activityLogs = [...MOCK_ACTIVITY_LOGS]

function delay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms))
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}`
}

function appendActivityLog(entry: Omit<ActivityLog, 'id' | 'occurredAt'>): void {
  activityLogs = [
    {
      ...entry,
      id: generateId('log'),
      occurredAt: new Date().toISOString(),
    },
    ...activityLogs,
  ]
}

// ——— Auth ———

export async function login(input: LoginInput): Promise<AuthResponse> {
  if (!USE_MOCK) {
    try {
      return await backend.backendLogin(input)
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Invalid email or password'))
    }
  }

  await delay(null)
  let user: User | null = null
  if (input.email === 'admin@tabitayo.ph') {
    user = MOCK_ADMIN
  } else if (input.email === 'maria@example.com') {
    user = MOCK_HOST
  }
  if (!user) throw new Error('Invalid email or password')

  appendActivityLog(
    buildLogFromUser(user, 'login', loginMessage(user))
  )

  const token =
    user.role === 'admin' ? 'mock-admin-token' : 'mock-host-token'
  return { token, user }
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  if (!USE_MOCK) {
    try {
      return await backend.backendRegister(input)
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Registration failed'))
    }
  }

  await delay(null)
  const user: User = {
    id: generateId('host'),
    email: input.email,
    role: 'host',
    displayName: input.displayName,
    hostStatus: 'pending',
  }
  hosts = [
    ...hosts,
    {
      ...user,
      role: 'host',
      status: 'pending',
      eventCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    },
  ]
  return { token: `mock-host-${user.id}`, user }
}

export async function recordLogout(user: User): Promise<void> {
  if (!USE_MOCK) {
    await backend.backendRecordLogout()
    return
  }
  appendActivityLog(
    buildLogFromUser(user, 'logout', logoutMessage(user))
  )
}

export async function getCurrentUser(): Promise<User | null> {
  const token = localStorage.getItem('tabitayo_token')
  if (!token) return null

  if (!USE_MOCK) {
    return backend.backendGetCurrentUser()
  }

  if (token === 'mock-admin-token') return MOCK_ADMIN
  if (token === 'mock-host-token') return MOCK_HOST
  if (token.startsWith('mock-host-')) {
    const hostId = token.slice('mock-host-'.length)
    const account = hosts.find((h) => h.id === hostId)
    if (account) {
      return {
        id: account.id,
        email: account.email,
        role: 'host',
        displayName: account.displayName,
        hostStatus: account.status,
      }
    }
  }
  return null
}

// ——— Events (public) ———

/** Public guest page — route param is `qr_code_token` (or legacy public_slug). */
export async function getEvent(lookupToken: string): Promise<Event | null> {
  if (!USE_MOCK) {
    return backend.backendGetPublicEvent(lookupToken)
  }

  const event =
    events.find(
      (e) =>
        e.qrCodeToken === lookupToken ||
        e.publicSlug === lookupToken ||
        e.id === lookupToken
    ) ?? null
  return delay(event)
}

/** Host dashboard — load event by internal UUID. */
export async function getHostEvent(eventId: string): Promise<Event | null> {
  if (!USE_MOCK) {
    return backend.backendGetHostEvent(eventId)
  }

  const event = events.find((e) => e.id === eventId) ?? null
  return delay(event)
}

/** Autocomplete while typing — live API on deploy; local mock uses guestNameSearch.ts. */
export async function getPublicGuestSuggestions(
  lookupToken: string,
  query: string
): Promise<GuestNameSuggestion[]> {
  const q = query.trim()
  if (q.length < 1) return []

  if (!USE_MOCK) {
    return backend.backendGetGuestSuggestions(lookupToken, q)
  }

  const event =
    events.find(
      (e) =>
        e.qrCodeToken === lookupToken ||
        e.publicSlug === lookupToken ||
        e.id === lookupToken
    ) ?? null
  if (!event || !isEventGuestLive(event)) return []

  const list = guests.filter((g) => g.eventId === event.id)
  return delay(
    filterGuestsForSuggestions(list, q).map((guest) => ({
      displayName: guest.fullName,
    }))
  )
}

/** Final seat assignment — always POST guest-lookup on deploy. */
export async function publicGuestLookup(
  lookupToken: string,
  payload: PublicGuestLookupPayload
): Promise<PublicGuestLookupResult | null> {
  if (!USE_MOCK) {
    return backend.backendPublicGuestLookup(lookupToken, payload)
  }

  const event =
    events.find(
      (e) =>
        e.qrCodeToken === lookupToken ||
        e.publicSlug === lookupToken ||
        e.id === lookupToken
    ) ?? null
  if (!event || !isEventGuestLive(event)) return null

  const list = guests.filter((g) => g.eventId === event.id)
  let match: Guest | undefined

  if ('lookup_token' in payload) {
    match = list.find((g) => g.lookupToken === payload.lookup_token)
  } else if ('invite_code' in payload && 'name' in payload) {
    const candidate = findGuestForNameLookup(list, payload.name)
    match =
      candidate &&
      candidate.inviteCode?.toUpperCase() === payload.invite_code.toUpperCase()
        ? candidate
        : undefined
  } else if ('name' in payload) {
    match = findGuestForNameLookup(list, payload.name)
  }

  if (!match) return null
  return delay({
    guestId: match.id,
    eventName: event.name,
    guestName: match.fullName,
    tableNumber: match.tableNumber,
    seatNumber: match.seatNumber,
    seatConfirmationStatus: match.seatConfirmationStatus,
  })
}

export async function confirmSeatFound(
  lookupToken: string,
  guestId: string
): Promise<PublicGuestLookupResult> {
  if (!USE_MOCK) {
    return backend.backendConfirmSeatFound(lookupToken, guestId)
  }

  const idx = guests.findIndex((g) => g.id === guestId)
  if (idx === -1) throw new Error('Guest not found')
  guests[idx] = {
    ...guests[idx],
    seatConfirmationStatus: 'seat_found',
    seatConfirmedAt: new Date().toISOString(),
  }
  const event = events.find((e) => e.id === guests[idx].eventId)!
  return delay({
    guestId: guests[idx].id,
    eventName: event.name,
    guestName: guests[idx].fullName,
    tableNumber: guests[idx].tableNumber,
    seatNumber: guests[idx].seatNumber,
    seatConfirmationStatus: 'seat_found',
  })
}

/** @deprecated Use publicGuestLookup */
export async function searchPublicGuest(
  lookupToken: string,
  name: string
): Promise<{ event: Event; guest: Guest } | null> {
  const result = await publicGuestLookup(lookupToken, { name })
  if (!result) return null
  const event = await getEvent(lookupToken)
  if (!event) return null
  return { event, guest: guestFromLookupResult(result, lookupToken) }
}

export async function getEventGuests(eventId: string): Promise<Guest[]> {
  if (!USE_MOCK) {
    return backend.backendGetEventGuests(eventId)
  }

  const event = events.find((e) => e.id === eventId || e.publicSlug === eventId)
  if (!event) return delay([])
  return delay(guests.filter((g) => g.eventId === event.id))
}

export async function getApprovedPhotos(lookupToken: string): Promise<PhotoShareItem[]> {
  if (!USE_MOCK) {
    return backend.backendGetPublicApprovedPhotos(lookupToken)
  }

  return delay(
    photos.filter((p) => p.eventId === lookupToken && p.status === 'approved')
  )
}

export async function uploadGuestPhoto(
  lookupToken: string,
  file: File,
  caption?: string
): Promise<PhotoShareItem> {
  if (!USE_MOCK) {
    return backend.backendUploadGuestPhoto(lookupToken, file, caption)
  }

  const item: PhotoShareItem = {
    id: generateId('ph'),
    eventId: lookupToken,
    imageUrl: URL.createObjectURL(file),
    caption,
    status: 'pending',
    uploadedAt: new Date().toISOString(),
  }
  photos = [...photos, item]
  return delay(item)
}

// ——— Host ———

export async function getHostEvents(hostId: string): Promise<Event[]> {
  if (!USE_MOCK) {
    return backend.backendGetHostEvents()
  }

  return delay(events.filter((e) => e.hostId === hostId))
}

export async function createEvent(
  hostId: string,
  input: CreateEventInput
): Promise<Event> {
  if (!USE_MOCK) {
    return backend.backendCreateEvent(input)
  }

  const id = generateId('evt')
  const event: Event = {
    id,
    publicSlug: id,
    qrCodeToken: id,
    qrCodePayload: `/e/${id}`,
    hostId,
    ...input,
    guestLookupMode: input.guestLookupMode ?? 'name_only',
    status: 'active',
    approvalStatus: 'pending_payment',
    setup: {
      hasMenu: false,
      hasFloorPlan: false,
      hasSpotifyPlaylist: false,
      hasQrCode: false,
    },
  }
  events = [...events, event]

  const actor = await getCurrentUser()
  if (actor) {
    appendActivityLog(
      buildLogFromUser(actor, 'add_event', addEventMessage(actor, event.name), event)
    )
  }

  return delay(event)
}

export async function uploadEventFloorPlan(eventId: string, file: File): Promise<Event> {
  if (!USE_MOCK) {
    if (!isUploadableImage(file)) throw new Error('Invalid file type')
    return backend.backendUploadFloorPlan(eventId, file)
  }

  if (!isUploadableImage(file)) {
    throw new Error('Invalid file type')
  }

  const dataUrl = await readImageAsDataUrl(file)
  const idx = events.findIndex((e) => e.id === eventId)
  if (idx === -1) throw new Error('Event not found')

  events[idx] = { ...events[idx], floorPlanUrl: dataUrl }

  const actor = await getCurrentUser()
  if (actor) {
    appendActivityLog(
      buildLogFromUser(
        actor,
        'configure_event',
        `${actor.displayName} uploaded floor plan for ${events[idx].name}`,
        events[idx]
      )
    )
  }

  return delay(events[idx])
}

export async function uploadEventMenuImage(eventId: string, file: File): Promise<Event> {
  if (!USE_MOCK) {
    if (!isUploadableImage(file)) throw new Error('Invalid file type')
    return backend.backendUploadMenu(eventId, file)
  }

  if (!isUploadableImage(file)) {
    throw new Error('Invalid file type')
  }

  const dataUrl = await readImageAsDataUrl(file)
  const idx = events.findIndex((e) => e.id === eventId)
  if (idx === -1) throw new Error('Event not found')

  events[idx] = {
    ...events[idx],
    menuDisplayMode: 'image',
    menuImageUrl: dataUrl,
    menu: undefined,
  }

  const actor = await getCurrentUser()
  if (actor) {
    appendActivityLog(
      buildLogFromUser(
        actor,
        'configure_event',
        `${actor.displayName} uploaded menu image for ${events[idx].name}`,
        events[idx]
      )
    )
  }

  return delay(events[idx])
}

export async function deleteEventFloorPlan(eventId: string): Promise<Event> {
  if (!USE_MOCK) {
    return backend.backendDeleteFloorPlan(eventId)
  }

  const idx = events.findIndex((e) => e.id === eventId)
  if (idx === -1) throw new Error('Event not found')
  events[idx] = { ...events[idx], floorPlanUrl: undefined }
  return delay(events[idx])
}

export async function deleteEventMenu(eventId: string): Promise<Event> {
  if (!USE_MOCK) {
    return backend.backendDeleteMenu(eventId)
  }

  const idx = events.findIndex((e) => e.id === eventId)
  if (idx === -1) throw new Error('Event not found')
  events[idx] = {
    ...events[idx],
    menuImageUrl: undefined,
    menuDisplayMode: events[idx].menu ? 'text' : undefined,
  }
  return delay(events[idx])
}

export async function setEventSpotifyPlaylist(
  eventId: string,
  spotifyPlaylistUrl: string
): Promise<Event> {
  if (!USE_MOCK) {
    return backend.backendSetSpotifyPlaylist(eventId, spotifyPlaylistUrl)
  }

  const idx = events.findIndex((e) => e.id === eventId)
  if (idx === -1) throw new Error('Event not found')
  events[idx] = { ...events[idx], spotifyUrl: spotifyPlaylistUrl }
  return delay(events[idx])
}

export async function clearEventSpotifyPlaylist(eventId: string): Promise<Event> {
  if (!USE_MOCK) {
    return backend.backendDeleteSpotifyPlaylist(eventId)
  }

  const idx = events.findIndex((e) => e.id === eventId)
  if (idx === -1) throw new Error('Event not found')
  events[idx] = { ...events[idx], spotifyUrl: undefined }
  return delay(events[idx])
}

export async function getOrCreateEventQrCode(eventId: string): Promise<QrCodeInfo> {
  if (!USE_MOCK) {
    return backend.backendGetOrCreateQrCode(eventId)
  }

  const event = events.find((e) => e.id === eventId)
  if (!event) throw new Error('Event not found')
  const token = event.qrCodeToken ?? event.publicSlug ?? event.id
  const info: QrCodeInfo = {
    eventId: event.id,
    qrCodeToken: token,
    qrCodePayload: `/e/${token}`,
    publicGuestPagePath: `/e/${token}`,
  }
  events = events.map((e) =>
    e.id === eventId
      ? {
          ...e,
          qrCodeToken: token,
          qrCodePayload: info.qrCodePayload,
          setup: {
            hasMenu: e.setup?.hasMenu ?? false,
            hasFloorPlan: e.setup?.hasFloorPlan ?? false,
            hasSpotifyPlaylist: e.setup?.hasSpotifyPlaylist ?? false,
            hasQrCode: true,
          },
        }
      : e
  )
  return delay(info)
}

export async function updateEvent(
  eventId: string,
  patch: Partial<Event>
): Promise<Event> {
  if (!USE_MOCK) {
    return backend.backendUpdateEvent(eventId, patch)
  }

  const idx = events.findIndex((e) => e.id === eventId)
  if (idx === -1) throw new Error('Event not found')
  events[idx] = { ...events[idx], ...patch }

  const actor = await getCurrentUser()
  if (actor && Object.keys(patch).length > 0) {
    appendActivityLog(
      buildLogFromUser(
        actor,
        'configure_event',
        configureEventMessage(actor, events[idx].name, patch),
        events[idx]
      )
    )
  }

  return delay(events[idx])
}

/** Soft-delete event — removes it from host lists and public guest lookup (API DELETE). */
export async function deleteEvent(eventId: string): Promise<void> {
  if (!USE_MOCK) {
    await backend.backendDeleteEvent(eventId)
    return
  }

  const removed = events.find((e) => e.id === eventId)
  events = events.filter((e) => e.id !== eventId)
  guests = guests.filter((g) => g.eventId !== eventId)
  photos = photos.filter((p) => p.eventId !== eventId)

  const actor = await getCurrentUser()
  if (actor && removed) {
    appendActivityLog(
      buildLogFromUser(
        actor,
        'configure_event',
        `${actor.displayName} deleted event ${removed.name}`,
        removed
      )
    )
  }

  return delay(undefined)
}

export async function addGuest(
  eventId: string,
  input: CreateGuestInput
): Promise<Guest> {
  if (!USE_MOCK) {
    return backend.backendAddGuest(eventId, input)
  }

  const guest: Guest = {
    id: generateId('g'),
    eventId,
    ...input,
  }
  guests = [...guests, guest]
  return delay(guest)
}

export async function uploadGuestsCsv(eventId: string, file: File): Promise<Guest[]> {
  if (!USE_MOCK) {
    const normalized = await normalizeGuestCsvForUpload(file)
    return backend.backendUploadGuestsCsv(eventId, normalized)
  }

  const inputs = await parseGuestCsvFile(file)
  return addGuestsBulk(eventId, inputs)
}

export async function addGuestsBulk(
  eventId: string,
  inputs: CreateGuestInput[]
): Promise<Guest[]> {
  if (!USE_MOCK) {
    throw new Error('Use CSV upload for bulk import with the API.')
  }

  const newGuests = inputs.map((input) => ({
    id: generateId('g'),
    eventId,
    ...input,
  }))
  guests = [...guests, ...newGuests]
  return delay(newGuests)
}

export async function deleteGuest(eventId: string, guestId: string): Promise<void> {
  if (!USE_MOCK) {
    await backend.backendDeleteGuest(eventId, guestId)
    return
  }

  guests = guests.filter((g) => g.id !== guestId)
  return delay(undefined)
}

export async function getEventPhotos(eventId: string): Promise<PhotoShareItem[]> {
  if (!USE_MOCK) {
    return backend.backendGetEventPhotos(eventId)
  }

  return delay(photos.filter((p) => p.eventId === eventId))
}

export async function updatePhotoStatus(
  eventId: string,
  photoId: string,
  status: PhotoShareItem['status']
): Promise<PhotoShareItem> {
  if (!USE_MOCK) {
    return backend.backendUpdatePhotoStatus(eventId, photoId, status)
  }

  const idx = photos.findIndex((p) => p.id === photoId)
  if (idx === -1) throw new Error('Photo not found')
  photos[idx] = { ...photos[idx], status }
  return delay(photos[idx])
}

export async function deleteEventPhoto(eventId: string, photoId: string): Promise<void> {
  if (!USE_MOCK) {
    await backend.backendDeleteEventPhoto(eventId, photoId)
    return
  }

  photos = photos.filter((p) => p.id !== photoId)
  return delay(undefined)
}

// ——— Admin ———

export async function getAllHosts(hostStatus?: HostAccount['status']): Promise<HostAccount[]> {
  if (!USE_MOCK) {
    return backend.backendGetAdminUsers(
      hostStatus ? { role: 'host', hostStatus } : { role: 'host' }
    )
  }

  const list = hostStatus ? hosts.filter((h) => h.status === hostStatus) : hosts
  return delay([...list])
}

export async function updateHostStatus(
  hostId: string,
  status: HostAccount['status'],
  reason?: string
): Promise<HostAccount> {
  if (!USE_MOCK) {
    return backend.backendUpdateHostStatus(hostId, status, reason)
  }

  const idx = hosts.findIndex((h) => h.id === hostId)
  if (idx === -1) throw new Error('Host not found')
  hosts[idx] = { ...hosts[idx], status }
  return delay(hosts[idx])
}

export async function getHostApprovalHistory(hostId: string): Promise<ActivityLog[]> {
  return getActivityLogs({ targetType: 'user', targetId: hostId, limit: 50 })
}

export async function submitEventPayment(eventId: string): Promise<Event> {
  if (!USE_MOCK) {
    return backend.backendSubmitEventPayment(eventId)
  }

  const idx = events.findIndex((e) => e.id === eventId)
  if (idx === -1) throw new Error('Event not found')
  if (events[idx].approvalStatus === 'approved') return delay(events[idx])

  events[idx] = {
    ...events[idx],
    approvalStatus: 'payment_submitted',
    paymentSubmittedAt: new Date().toISOString(),
  }

  const actor = await getCurrentUser()
  if (actor) {
    appendActivityLog(
      buildLogFromUser(
        actor,
        'configure_event',
        `${actor.displayName} marked payment submitted for ${events[idx].name}`,
        events[idx]
      )
    )
  }

  return delay(events[idx])
}

export async function approveEvent(eventId: string): Promise<Event> {
  if (!USE_MOCK) {
    return backend.backendApproveEvent(eventId)
  }

  const idx = events.findIndex((e) => e.id === eventId)
  if (idx === -1) throw new Error('Event not found')

  events[idx] = {
    ...events[idx],
    approvalStatus: 'approved',
    approvedAt: new Date().toISOString(),
    rejectionReason: undefined,
    rejectedAt: undefined,
  }

  const actor = await getCurrentUser()
  if (actor) {
    appendActivityLog(
      buildLogFromUser(
        actor,
        'configure_event',
        `${actor.displayName} approved event ${events[idx].name} (payment confirmed)`,
        events[idx]
      )
    )
  }

  return delay(events[idx])
}

export async function rejectEvent(eventId: string, reason?: string): Promise<Event> {
  if (!USE_MOCK) {
    return backend.backendRejectEvent(eventId, reason)
  }

  const idx = events.findIndex((e) => e.id === eventId)
  if (idx === -1) throw new Error('Event not found')

  events[idx] = {
    ...events[idx],
    approvalStatus: 'rejected',
    rejectedAt: new Date().toISOString(),
    rejectionReason: reason?.trim() || 'Payment could not be verified',
  }

  const actor = await getCurrentUser()
  if (actor) {
    appendActivityLog(
      buildLogFromUser(
        actor,
        'configure_event',
        `${actor.displayName} rejected event ${events[idx].name}`,
        events[idx]
      )
    )
  }

  return delay(events[idx])
}

export async function getAllEvents(): Promise<Event[]> {
  if (!USE_MOCK) {
    return backend.backendGetAdminEvents()
  }

  return delay([...events])
}

export async function getActivityLogs(
  filters: ActivityLogFilters = {}
): Promise<ActivityLog[]> {
  if (!USE_MOCK) {
    return backend.backendGetActivityLogs(filters)
  }

  let result = [...activityLogs]

  if (filters.action && filters.action !== 'all') {
    result = result.filter((log) => log.action === filters.action)
  }

  if (filters.fromDate) {
    const from = new Date(`${filters.fromDate}T00:00:00`).toISOString()
    result = result.filter((log) => log.occurredAt >= from)
  }

  if (filters.toDate) {
    const to = new Date(`${filters.toDate}T23:59:59.999`).toISOString()
    result = result.filter((log) => log.occurredAt <= to)
  }

  result.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
  return delay(result)
}

