import type { Event, EventMenu, EventTier, MenuDisplayMode, CreateEventInput } from '@/types/event'
import type { Guest, CreateGuestInput } from '@/types/guest'
import type { HostAccount, HostStatus, User, UserRole } from '@/types/user'
import type {
  ApiAuthResponse,
  ApiEvent,
  ApiGuest,
  ApiGuestSearchResult,
  ApiMenuJson,
  ApiPublicEvent,
  ApiUser,
} from './dto'

function mapHostStatus(status?: string | null): HostStatus {
  switch (status) {
    case 'active':
    case 'approved':
      return 'approved'
    case 'suspended':
      return 'suspended'
    default:
      return 'pending'
  }
}

export function mapUser(dto: ApiUser): User {
  return {
    id: dto.id,
    email: dto.email,
    role: dto.role as UserRole,
    displayName: dto.display_name,
  }
}

export function mapHostAccount(dto: ApiUser, eventCount = 0): HostAccount {
  return {
    ...mapUser(dto),
    role: 'host',
    status: mapHostStatus(dto.host_status),
    eventCount,
    createdAt: dto.created_at.slice(0, 10),
  }
}

export function mapAuthResponse(dto: ApiAuthResponse): { token: string; user: User } {
  return {
    token: dto.access_token,
    user: mapUser(dto.user),
  }
}

function mapMenuJson(menu?: ApiMenuJson | null): Pick<Event, 'menu' | 'menuDisplayMode' | 'menuImageUrl'> {
  if (!menu) return {}

  const mode: MenuDisplayMode =
    menu.display_mode === 'image' || menu.image_url ? 'image' : 'text'

  if (mode === 'image' && menu.image_url) {
    return { menuDisplayMode: 'image', menuImageUrl: menu.image_url, menu: undefined }
  }

  const courses: EventMenu = {
    appetizer: menu.appetizer ?? undefined,
    main: menu.main ?? undefined,
    dessert: menu.dessert ?? undefined,
  }

  return { menuDisplayMode: 'text', menu: courses, menuImageUrl: undefined }
}

export function mapEvent(dto: ApiEvent): Event {
  const menuFields = mapMenuJson(dto.menu_json)

  return {
    id: dto.id,
    publicSlug: dto.public_slug,
    hostId: dto.host_id,
    name: dto.name,
    date: dto.date,
    venue: dto.venue,
    tier: dto.tier as EventTier,
    status: dto.status as Event['status'],
    approvalStatus: dto.approval_status as Event['approvalStatus'],
    paymentSubmittedAt: dto.payment_submitted_at ?? undefined,
    approvedAt: dto.approved_at ?? undefined,
    rejectedAt: dto.rejected_at ?? undefined,
    rejectionReason: dto.rejection_reason ?? undefined,
    floorPlanUrl: dto.floor_plan_url ?? undefined,
    spotifyUrl: dto.spotify_url ?? undefined,
    photoShareEnabled: dto.photo_share_enabled,
    customBranding: dto.custom_branding_json
      ? {
          primaryColor: dto.custom_branding_json.primary_color ?? '#e8c4b8',
          logoUrl: dto.custom_branding_json.logo_url ?? '',
        }
      : undefined,
    ...menuFields,
  }
}

export function mapPublicEvent(dto: ApiPublicEvent, publicSlug: string): Event {
  const menuSource = dto.menu_json ?? dto.menu
  const menuFields = mapMenuJson(menuSource)

  return {
    id: publicSlug,
    publicSlug,
    hostId: '',
    name: dto.event_name ?? 'Event',
    date: dto.event_date,
    venue: dto.venue,
    tier: (dto.tier as EventTier) ?? 'free',
    status: (dto.status as Event['status']) ?? 'active',
    approvalStatus: (dto.approval_status as Event['approvalStatus']) ?? 'approved',
    floorPlanUrl: dto.floor_plan_url ?? undefined,
    spotifyUrl: dto.spotify_url ?? undefined,
    photoShareEnabled: dto.photo_share_enabled ?? false,
    customBranding: dto.custom_branding_json
      ? {
          primaryColor: dto.custom_branding_json.primary_color ?? '#e8c4b8',
          logoUrl: dto.custom_branding_json.logo_url ?? '',
        }
      : undefined,
    ...menuFields,
  }
}

export function mapGuest(dto: ApiGuest): Guest {
  return {
    id: dto.id,
    eventId: dto.event_id,
    fullName: dto.full_name,
    alias: dto.alias ?? undefined,
    tableNumber: dto.table_number,
    seatNumber: dto.seat_number ?? undefined,
  }
}

export function guestFromSearchResult(dto: ApiGuestSearchResult, publicSlug: string): Guest {
  return {
    id: `search-${publicSlug}-${dto.guest_name}`,
    eventId: publicSlug,
    fullName: dto.guest_name,
    tableNumber: dto.table_number,
    seatNumber: dto.seat_number ?? undefined,
  }
}

export function toCreateEventBody(input: CreateEventInput) {
  return {
    name: input.name,
    date: input.date,
    venue: input.venue,
    tier: input.tier,
    photo_share_enabled: input.photoShareEnabled,
  }
}

export function toCreateGuestBody(input: CreateGuestInput) {
  return {
    full_name: input.fullName,
    alias: input.alias ?? null,
    table_number: input.tableNumber,
    seat_number: input.seatNumber ?? null,
  }
}

export function toEventPatch(patch: Partial<Event>): Record<string, unknown> {
  const body: Record<string, unknown> = {}

  if (patch.name !== undefined) body.name = patch.name
  if (patch.date !== undefined) body.date = patch.date
  if (patch.venue !== undefined) body.venue = patch.venue
  if (patch.tier !== undefined) body.tier = patch.tier
  if (patch.status !== undefined) body.status = patch.status
  if (patch.floorPlanUrl !== undefined) body.floor_plan_url = patch.floorPlanUrl
  if (patch.spotifyUrl !== undefined) body.spotify_url = patch.spotifyUrl
  if (patch.photoShareEnabled !== undefined) {
    body.photo_share_enabled = patch.photoShareEnabled
  }

  if (patch.menu !== undefined || patch.menuDisplayMode !== undefined || patch.menuImageUrl !== undefined) {
    const mode = patch.menuDisplayMode ?? (patch.menuImageUrl ? 'image' : 'text')
    if (mode === 'image') {
      body.menu_json = {
        display_mode: 'image',
        image_url: patch.menuImageUrl ?? null,
      }
    } else if (patch.menu) {
      body.menu_json = {
        display_mode: 'text',
        appetizer: patch.menu.appetizer ?? null,
        main: patch.menu.main ?? null,
        dessert: patch.menu.dessert ?? null,
      }
    } else {
      body.menu_json = null
    }
  }

  if (patch.customBranding !== undefined) {
    body.custom_branding_json = patch.customBranding
      ? {
          primary_color: patch.customBranding.primaryColor,
          logo_url: patch.customBranding.logoUrl,
        }
      : null
  }

  if (patch.approvalStatus !== undefined) body.approval_status = patch.approvalStatus
  if (patch.paymentSubmittedAt !== undefined) {
    body.payment_submitted_at = patch.paymentSubmittedAt
  }

  return body
}

export function unwrapGuestList(data: unknown): ApiGuest[] {
  if (Array.isArray(data)) return data as ApiGuest[]
  const obj = data as { items?: ApiGuest[]; guests?: ApiGuest[] }
  return obj.items ?? obj.guests ?? []
}
