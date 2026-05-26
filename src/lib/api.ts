import Papa from 'papaparse'
import type { Event, CreateEventInput, PhotoShareItem } from '@/types/event'
import { USE_MOCK } from '@/lib/api/config'
import * as backend from '@/lib/api/backend'
import { getApiErrorMessage } from '@/lib/api/errors'
import type { Guest, CreateGuestInput } from '@/types/guest'
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
  return { token: 'mock-host-token', user }
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
  return null
}

// ——— Events (public) ———

/** Public guest page — `eventId` route param is the event `public_slug`. */
export async function getEvent(publicSlug: string): Promise<Event | null> {
  if (!USE_MOCK) {
    return backend.backendGetPublicEvent(publicSlug)
  }

  const event =
    events.find((e) => e.publicSlug === publicSlug || e.id === publicSlug) ?? null
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

export async function searchPublicGuest(
  publicSlug: string,
  name: string
): Promise<{ event: Event; guest: Guest } | null> {
  if (!USE_MOCK) {
    return backend.backendSearchPublicGuest(publicSlug, name)
  }

  const event =
    events.find((e) => e.publicSlug === publicSlug || e.id === publicSlug) ?? null
  if (!event || !isEventGuestLive(event)) return null

  const list = guests.filter((g) => g.eventId === event.id)
  const q = name.trim().toLowerCase()
  const match =
    list.find((g) => g.fullName.toLowerCase() === q) ??
    list.find((g) => g.fullName.toLowerCase().includes(q)) ??
    list.find((g) => g.alias?.toLowerCase().includes(q))

  if (!match) return null
  return delay({ event, guest: match })
}

export async function getEventGuests(eventId: string): Promise<Guest[]> {
  if (!USE_MOCK) {
    return backend.backendGetEventGuests(eventId)
  }

  const event = events.find((e) => e.id === eventId || e.publicSlug === eventId)
  if (!event) return delay([])
  return delay(guests.filter((g) => g.eventId === event.id))
}

export async function getApprovedPhotos(eventId: string): Promise<PhotoShareItem[]> {
  if (!USE_MOCK) {
    return backend.backendGetApprovedPhotos(eventId)
  }

  return delay(
    photos.filter((p) => p.eventId === eventId && p.status === 'approved')
  )
}

export async function uploadGuestPhoto(
  eventId: string,
  file: File,
  caption?: string
): Promise<PhotoShareItem> {
  if (!USE_MOCK) {
    return backend.backendUploadGuestPhoto()
  }

  const item: PhotoShareItem = {
    id: generateId('ph'),
    eventId,
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
    hostId,
    ...input,
    status: 'active',
    approvalStatus: 'pending_payment',
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
    const dataUrl = await readImageAsDataUrl(file)
    return backend.backendUpdateEvent(eventId, { floorPlanUrl: dataUrl })
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
    const dataUrl = await readImageAsDataUrl(file)
    return backend.backendUpdateEvent(eventId, {
      menuDisplayMode: 'image',
      menuImageUrl: dataUrl,
      menu: undefined,
    })
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
    return backend.backendUploadGuestsCsv(eventId, file)
  }

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const inputs: CreateGuestInput[] = []
        for (const row of results.data) {
          const fullName =
            row.full_name ?? row.fullName ?? row.name ?? row['Full Name']
          const tableNumber =
            row.table_number ?? row.tableNumber ?? row.table ?? row['Table']
          if (!fullName?.trim() || !tableNumber?.trim()) continue
          inputs.push({
            fullName: fullName.trim(),
            alias: (row.alias ?? row.Alias)?.trim() || undefined,
            tableNumber: tableNumber.trim(),
            seatNumber:
              (row.seat_number ?? row.seatNumber ?? row.seat)?.trim() || undefined,
          })
        }

        if (inputs.length === 0) {
          reject(new Error('No valid rows found.'))
          return
        }
        resolve(await addGuestsBulk(eventId, inputs))
      },
      error: () => reject(new Error('Could not parse CSV file.')),
    })
  })
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
  photoId: string,
  status: PhotoShareItem['status']
): Promise<PhotoShareItem> {
  if (!USE_MOCK) {
    return backend.backendUpdatePhotoStatus()
  }

  const idx = photos.findIndex((p) => p.id === photoId)
  if (idx === -1) throw new Error('Photo not found')
  photos[idx] = { ...photos[idx], status }
  return delay(photos[idx])
}

// ——— Admin ———

export async function getAllHosts(): Promise<HostAccount[]> {
  if (!USE_MOCK) {
    return backend.backendGetAdminUsers()
  }

  return delay([...hosts])
}

export async function updateHostStatus(
  hostId: string,
  status: HostAccount['status']
): Promise<HostAccount> {
  if (!USE_MOCK) {
    return backend.backendUpdateHostStatus(hostId, status)
  }

  const idx = hosts.findIndex((h) => h.id === hostId)
  if (idx === -1) throw new Error('Host not found')
  hosts[idx] = { ...hosts[idx], status }
  return delay(hosts[idx])
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

