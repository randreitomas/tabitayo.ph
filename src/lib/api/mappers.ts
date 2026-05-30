import type {
  Event,
  EventMenu,
  EventSetup,
  EventTier,
  GuestLookupMode,
  MenuDisplayMode,
  CreateEventInput,
  PhotoShareItem,
  QrCodeInfo,
} from '@/types/event'
import type {
  Guest,
  CreateGuestInput,
  GuestNameSuggestion,
  PublicGuestLookupResult,
  SeatConfirmationStatus,
} from '@/types/guest'
import type { ActivityLog } from '@/types/activityLog'
import type { HostAccount, HostStatus, User, UserRole } from '@/types/user'
import type {
  ApiAuthResponse,
  ApiEvent,
  ApiEventSetup,
  ApiGuest,
  ApiGuestLookupResponse,
  ApiGuestSearchResult,
  ApiMenuAssetRead,
  ApiMenuJson,
  ApiActivityLog,
  ApiPhotoShareItem,
  ApiPublicEvent,
  ApiPublicGuestSuggestionResponse,
  ApiQrCode,
  ApiSeatConfirmResponse,
  ApiUser,
} from './dto'
import { resolveMediaUrl } from './mediaUrl'

function mapHostStatus(status?: string | null): HostStatus {
  if (status === 'active' || status === 'disabled' || status === 'pending') return status
  if (status === 'approved') return 'active'
  if (status === 'suspended') return 'disabled'
  // Some /auth/me responses omit host_status for approved hosts; do not treat as pending.
  if (status == null || status === '') return 'active'
  return 'pending'
}

function mapSetup(dto?: ApiEventSetup): EventSetup | undefined {
  if (!dto) return undefined
  return {
    hasMenu: dto.has_menu,
    hasFloorPlan: dto.has_floor_plan,
    hasSpotifyPlaylist: dto.has_spotify_playlist,
    hasQrCode: dto.has_qr_code,
  }
}

function mapGuestLookupMode(mode?: string): GuestLookupMode {
  if (mode === 'invite_code' || mode === 'personal_token') return mode
  return 'name_only'
}

export function mapUser(dto: ApiUser): User {
  const user: User = {
    id: dto.id,
    email: dto.email,
    role: dto.role as UserRole,
    displayName: dto.display_name,
  }
  if (dto.role === 'host') {
    user.hostStatus = mapHostStatus(dto.host_status)
  }
  return user
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

export function mapMenuAssetRead(dto: ApiMenuAssetRead): Pick<Event, 'menu' | 'menuDisplayMode' | 'menuImageUrl'> {
  return mapMenuJson(dto.menu)
}

function mapMenuJson(menu?: ApiMenuJson | null): Pick<Event, 'menu' | 'menuDisplayMode' | 'menuImageUrl'> {
  if (!menu) return {}

  const imageUrl = resolveMediaUrl(menu.image_url ?? undefined)
  const mode: MenuDisplayMode =
    menu.display_mode === 'image' || imageUrl ? 'image' : 'text'

  if (mode === 'image' && imageUrl) {
    return { menuDisplayMode: 'image', menuImageUrl: imageUrl, menu: undefined }
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
    name: dto.name ?? 'Event',
    date: dto.date ?? '',
    venue: dto.venue ?? '',
    tier: (dto.tier as EventTier) ?? 'free',
    status: (dto.status as Event['status']) ?? 'active',
    guestLookupMode: mapGuestLookupMode(dto.guest_lookup_mode),
    approvalStatus: (dto.approval_status as Event['approvalStatus']) ?? 'pending_payment',
    photoShareEnabled: dto.photo_share_enabled ?? false,
    paymentSubmittedAt: dto.payment_submitted_at ?? undefined,
    approvedAt: dto.approved_at ?? undefined,
    rejectedAt: dto.rejected_at ?? undefined,
    rejectionReason: dto.rejection_reason ?? undefined,
    floorPlanUrl: resolveMediaUrl(dto.floor_plan_url ?? undefined),
    spotifyUrl: dto.spotify_url ?? undefined,
    customBranding: dto.custom_branding_json
      ? {
          primaryColor: dto.custom_branding_json.primary_color ?? '#e8c4b8',
          logoUrl: dto.custom_branding_json.logo_url ?? '',
        }
      : undefined,
    setup: mapSetup(dto.setup),
    ...menuFields,
  }
}

export function mapPublicEvent(dto: ApiPublicEvent, lookupToken: string): Event {
  const menuSource = dto.menu_json ?? dto.menu
  const menuFields = mapMenuJson(menuSource)

  return {
    id: lookupToken,
    publicSlug: lookupToken,
    hostId: '',
    name: dto.event_name ?? 'Event',
    date: dto.event_date,
    venue: dto.venue,
    tier: (dto.tier as EventTier) ?? 'free',
    status: (dto.status as Event['status']) ?? 'active',
    guestLookupMode: mapGuestLookupMode(dto.guest_lookup_mode),
    approvalStatus: (dto.approval_status as Event['approvalStatus']) ?? 'approved',
    floorPlanUrl: resolveMediaUrl(dto.floor_plan_url ?? undefined),
    spotifyUrl: dto.spotify_url ?? undefined,
    photoShareEnabled: dto.photo_share_enabled ?? false,
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
    inviteCode: dto.invite_code ?? undefined,
    lookupToken: dto.lookup_token ?? undefined,
    seatConfirmationStatus:
      (dto.seat_confirmation_status as SeatConfirmationStatus) ?? 'not_confirmed',
    seatConfirmedAt: dto.seat_confirmed_at ?? undefined,
  }
}

export function mapGuestLookupResult(dto: ApiGuestLookupResponse): PublicGuestLookupResult {
  return {
    guestId: dto.guest_id,
    eventName: dto.event_name,
    guestName: dto.guest_name,
    tableNumber: dto.table_number,
    seatNumber: dto.seat_number ?? undefined,
    seatConfirmationStatus: (dto.seat_confirmation_status as SeatConfirmationStatus) ?? undefined,
  }
}

export function mapGuestSuggestions(dto: ApiPublicGuestSuggestionResponse): GuestNameSuggestion[] {
  return dto.items.map((item) => ({ displayName: item.display_name }))
}

export function guestFromLookupResult(
  result: PublicGuestLookupResult,
  lookupToken: string
): Guest {
  return {
    id: result.guestId,
    eventId: lookupToken,
    fullName: result.guestName,
    tableNumber: result.tableNumber,
    seatNumber: result.seatNumber,
    seatConfirmationStatus: result.seatConfirmationStatus,
  }
}

/** @deprecated Legacy GET search */
export function guestFromSearchResult(dto: ApiGuestSearchResult, lookupToken: string): Guest {
  return {
    id: `search-${lookupToken}-${dto.guest_name}`,
    eventId: lookupToken,
    fullName: dto.guest_name,
    tableNumber: dto.table_number,
    seatNumber: dto.seat_number ?? undefined,
  }
}

export function mapQrCode(dto: ApiQrCode): QrCodeInfo {
  return {
    eventId: dto.event_id,
    qrCodeToken: dto.qr_code_token,
    qrCodePayload: dto.qr_code_payload,
    publicGuestPagePath: dto.public_guest_page_path,
  }
}

export function mapSeatConfirm(dto: ApiSeatConfirmResponse): PublicGuestLookupResult {
  return {
    ...mapGuestLookupResult(dto),
    seatConfirmationStatus: 'seat_found',
  }
}

export function toCreateEventBody(input: CreateEventInput) {
  return {
    name: input.name,
    date: input.date,
    venue: input.venue,
    tier: input.tier,
    photo_share_enabled: input.photoShareEnabled,
    photo_share_public_gallery_acknowledged: input.photoShareEnabled
      ? (input.photoSharePublicGalleryAcknowledged ?? false)
      : false,
    guest_lookup_mode: input.guestLookupMode ?? 'name_only',
  }
}

export function toCreateGuestBody(input: CreateGuestInput) {
  return {
    full_name: input.fullName,
    alias: input.alias ?? null,
    table_number: input.tableNumber,
    seat_number: input.seatNumber ?? null,
    invite_code: input.inviteCode ?? null,
  }
}

export function toEventPatch(patch: Partial<Event>): Record<string, unknown> {
  const body: Record<string, unknown> = {}

  if (patch.name !== undefined) body.name = patch.name
  if (patch.date !== undefined) body.date = patch.date
  if (patch.venue !== undefined) body.venue = patch.venue
  if (patch.tier !== undefined) body.tier = patch.tier
  if (patch.status !== undefined) body.status = patch.status
  if (patch.guestLookupMode !== undefined) body.guest_lookup_mode = patch.guestLookupMode
  if (patch.spotifyUrl !== undefined) body.spotify_url = patch.spotifyUrl
  if (patch.photoShareEnabled !== undefined) {
    body.photo_share_enabled = patch.photoShareEnabled
  }

  if (patch.menu !== undefined || patch.menuDisplayMode !== undefined || patch.menuImageUrl !== undefined) {
    const mode = patch.menuDisplayMode ?? (patch.menuImageUrl ? 'image' : 'text')
    if (mode === 'text' && patch.menu) {
      body.menu_json = {
        display_mode: 'text',
        appetizer: patch.menu.appetizer ?? null,
        main: patch.menu.main ?? null,
        dessert: patch.menu.dessert ?? null,
      }
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

  return body
}

export function unwrapGuestList(data: unknown): ApiGuest[] {
  if (Array.isArray(data)) return data as ApiGuest[]
  const obj = data as { items?: ApiGuest[]; guests?: ApiGuest[] }
  return obj.items ?? obj.guests ?? []
}

export function mapActivityLog(dto: ApiActivityLog): ActivityLog {
  return {
    id: dto.id,
    action: dto.action,
    occurredAt: dto.created_at,
    actorId: dto.actor_user_id,
    actorEmail: dto.actor_email,
    actorName: dto.actor_display_name,
    actorRole: dto.actor_role === 'admin' ? 'admin' : 'host',
    message: dto.message,
    eventId: dto.event_id ?? undefined,
    eventName: dto.event_name ?? undefined,
    targetType: dto.target_type ?? undefined,
    targetId: dto.target_id ?? undefined,
  }
}

export function mapPhotoShareItem(
  dto: ApiPhotoShareItem,
  eventId = '',
  options?: { forPublicGallery?: boolean }
): PhotoShareItem {
  return {
    id: dto.id,
    eventId: dto.event_id ?? eventId,
    imageUrl: options?.forPublicGallery
      ? (resolveMediaUrl(dto.image_url) ?? dto.image_url)
      : dto.image_url,
    storageKey: dto.storage_key,
    caption: dto.caption ?? undefined,
    status: (dto.status as PhotoShareItem['status']) ?? 'pending',
    uploadedAt: dto.created_at,
  }
}
