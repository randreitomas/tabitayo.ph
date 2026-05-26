export type EventTier = 'free' | 'standard' | 'premium'
export type EventStatus = 'active' | 'ended' | 'archived'

export interface Event {
  id: string
  hostId: string
  name: string
  date: string
  venue: string
  tier: EventTier
  status: EventStatus
  floorPlanUrl?: string
  menuContent?: string
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
