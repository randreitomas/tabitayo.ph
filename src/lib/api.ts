import axios from 'axios'
import type { Event, CreateEventInput, PhotoShareItem } from '@/types/event'
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

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tabitayo_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

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
    const { data } = await api.post<AuthResponse>('/auth/login', input)
    return data
  }

  await delay(null)
  let user: User | null = null
  if (input.email === 'admin@tabitayo.ph') {
    user = MOCK_ADMIN
  } else if (input.email === 'maria@example.com' || input.email.includes('@')) {
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
    const { data } = await api.post<AuthResponse>('/auth/register', input)
    return data
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
    await api.post('/admin/activity-logs/logout', { userId: user.id })
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
    const { data } = await api.get<User>('/auth/me')
    return data
  }

  if (token === 'mock-admin-token') return MOCK_ADMIN
  if (token === 'mock-host-token') return MOCK_HOST
  return null
}

// ——— Events (public) ———

export async function getEvent(eventId: string): Promise<Event | null> {
  if (!USE_MOCK) {
    const { data } = await api.get<Event>(`/events/${eventId}`)
    return data
  }

  const event = events.find((e) => e.id === eventId) ?? null
  return delay(event)
}

export async function getEventGuests(eventId: string): Promise<Guest[]> {
  if (!USE_MOCK) {
    const { data } = await api.get<Guest[]>(`/events/${eventId}/guests`)
    return data
  }

  return delay(guests.filter((g) => g.eventId === eventId))
}

export async function getApprovedPhotos(eventId: string): Promise<PhotoShareItem[]> {
  if (!USE_MOCK) {
    const { data } = await api.get<PhotoShareItem[]>(
      `/events/${eventId}/photos?status=approved`
    )
    return data
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
    const form = new FormData()
    form.append('file', file)
    if (caption) form.append('caption', caption)
    const { data } = await api.post<PhotoShareItem>(
      `/events/${eventId}/photos`,
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return data
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
    const { data } = await api.get<Event[]>(`/hosts/${hostId}/events`)
    return data
  }

  return delay(events.filter((e) => e.hostId === hostId))
}

export async function createEvent(
  hostId: string,
  input: CreateEventInput
): Promise<Event> {
  if (!USE_MOCK) {
    const { data } = await api.post<Event>('/events', { ...input, hostId })
    return data
  }

  const event: Event = {
    id: generateId('evt'),
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
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post<Event>(`/events/${eventId}/floor-plan`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
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
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post<Event>(`/events/${eventId}/menu-image`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
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
    const { data } = await api.patch<Event>(`/events/${eventId}`, patch)
    return data
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
    const { data } = await api.post<Guest>(`/events/${eventId}/guests`, input)
    return data
  }

  const guest: Guest = {
    id: generateId('g'),
    eventId,
    ...input,
  }
  guests = [...guests, guest]
  return delay(guest)
}

export async function addGuestsBulk(
  eventId: string,
  inputs: CreateGuestInput[]
): Promise<Guest[]> {
  if (!USE_MOCK) {
    const { data } = await api.post<Guest[]>(
      `/events/${eventId}/guests/bulk`,
      { guests: inputs }
    )
    return data
  }

  const newGuests = inputs.map((input) => ({
    id: generateId('g'),
    eventId,
    ...input,
  }))
  guests = [...guests, ...newGuests]
  return delay(newGuests)
}

export async function deleteGuest(guestId: string): Promise<void> {
  if (!USE_MOCK) {
    await api.delete(`/guests/${guestId}`)
    return
  }

  guests = guests.filter((g) => g.id !== guestId)
  return delay(undefined)
}

export async function getEventPhotos(eventId: string): Promise<PhotoShareItem[]> {
  if (!USE_MOCK) {
    const { data } = await api.get<PhotoShareItem[]>(`/events/${eventId}/photos`)
    return data
  }

  return delay(photos.filter((p) => p.eventId === eventId))
}

export async function updatePhotoStatus(
  photoId: string,
  status: PhotoShareItem['status']
): Promise<PhotoShareItem> {
  if (!USE_MOCK) {
    const { data } = await api.patch<PhotoShareItem>(`/photos/${photoId}`, {
      status,
    })
    return data
  }

  const idx = photos.findIndex((p) => p.id === photoId)
  if (idx === -1) throw new Error('Photo not found')
  photos[idx] = { ...photos[idx], status }
  return delay(photos[idx])
}

// ——— Admin ———

export async function getAllHosts(): Promise<HostAccount[]> {
  if (!USE_MOCK) {
    const { data } = await api.get<HostAccount[]>('/admin/hosts')
    return data
  }

  return delay([...hosts])
}

export async function updateHostStatus(
  hostId: string,
  status: HostAccount['status']
): Promise<HostAccount> {
  if (!USE_MOCK) {
    const { data } = await api.patch<HostAccount>(`/admin/hosts/${hostId}`, {
      status,
    })
    return data
  }

  const idx = hosts.findIndex((h) => h.id === hostId)
  if (idx === -1) throw new Error('Host not found')
  hosts[idx] = { ...hosts[idx], status }
  return delay(hosts[idx])
}

export async function submitEventPayment(eventId: string): Promise<Event> {
  if (!USE_MOCK) {
    const { data } = await api.post<Event>(`/events/${eventId}/submit-payment`)
    return data
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
    const { data } = await api.post<Event>(`/admin/events/${eventId}/approve`)
    return data
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
    const { data } = await api.post<Event>(`/admin/events/${eventId}/reject`, { reason })
    return data
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
    const { data } = await api.get<Event[]>('/admin/events')
    return data
  }

  return delay([...events])
}

export async function getActivityLogs(
  filters: ActivityLogFilters = {}
): Promise<ActivityLog[]> {
  if (!USE_MOCK) {
    const { data } = await api.get<ActivityLog[]>('/admin/activity-logs', {
      params: filters,
    })
    return data
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

export default api
