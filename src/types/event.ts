export type EventTier = 'free' | 'standard' | 'premium'
export type EventStatus = 'active' | 'ended' | 'archived'

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

export interface Event {
  id: string
  /** Public guest URL segment (`/e/:slug`) */
  publicSlug?: string
  hostId: string
  name: string
  date: string
  venue: string
  tier: EventTier
  status: EventStatus
  approvalStatus: EventApprovalStatus
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
}

export interface CreateEventInput {
  name: string
  date: string
  venue: string
  tier: EventTier
  photoShareEnabled: boolean
}

export interface PhotoShareItem {
  id: string
  eventId: string
  imageUrl: string
  caption?: string
  status: 'pending' | 'approved' | 'rejected'
  uploadedAt: string
}
