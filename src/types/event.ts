export type EventTier = 'free' | 'standard' | 'premium'
export type EventStatus = 'active' | 'ended' | 'archived' | 'cancelled'

export type GuestLookupMode = 'name_only' | 'invite_code' | 'personal_token'

/** Manual payment + admin review before the guest page goes live */
export type EventApprovalStatus =
  | 'pending_payment'
  | 'payment_submitted'
  | 'approved'
  | 'rejected'

export interface EventMenu {
  appetizer?: string
  main?: string
  dessert?: string
}

/** How the menu is shown to guests — hosts pick one, not both */
export type MenuDisplayMode = 'text' | 'image'

export interface EventSetup {
  hasMenu: boolean
  hasFloorPlan: boolean
  hasSpotifyPlaylist: boolean
  hasQrCode: boolean
}

export interface Event {
  id: string
  /** Legacy public slug (compat); guest QR uses qrCodeToken */
  publicSlug?: string
  /** Token for `/e/:lookupToken` and public API */
  qrCodeToken?: string
  /** e.g. `/e/{token}` from POST /qr-code */
  qrCodePayload?: string
  hostId: string
  name: string
  date: string
  venue: string
  tier: EventTier
  status: EventStatus
  approvalStatus: EventApprovalStatus
  guestLookupMode: GuestLookupMode
  paymentSubmittedAt?: string
  approvedAt?: string
  rejectedAt?: string
  rejectionReason?: string
  floorPlanUrl?: string
  menuDisplayMode?: MenuDisplayMode
  menu?: EventMenu
  menuImageUrl?: string
  spotifyUrl?: string
  photoShareEnabled: boolean
  customBranding?: { primaryColor: string; logoUrl: string }
  setup?: EventSetup
}

export interface CreateEventInput {
  name: string
  date: string
  venue: string
  tier: EventTier
  photoShareEnabled: boolean
  /** Required by API when `photoShareEnabled` is true. */
  photoSharePublicGalleryAcknowledged?: boolean
  guestLookupMode?: GuestLookupMode
}

export interface PhotoShareItem {
  id: string
  eventId: string
  imageUrl: string
  /** Host-only; required to preview pending/rejected photos (not on public media). */
  storageKey?: string
  caption?: string
  status: 'pending' | 'approved' | 'rejected'
  uploadedAt: string
}

export interface QrCodeInfo {
  eventId: string
  qrCodeToken: string
  qrCodePayload: string
  publicGuestPagePath: string
}
