export type SeatConfirmationStatus = 'not_confirmed' | 'seat_found'

export interface Guest {
  id: string
  eventId: string
  fullName: string
  alias?: string
  tableNumber: string
  seatNumber?: string
  inviteCode?: string
  lookupToken?: string
  seatConfirmationStatus?: SeatConfirmationStatus
  seatConfirmedAt?: string
}

export interface CreateGuestInput {
  fullName: string
  alias?: string
  tableNumber: string
  seatNumber?: string
  inviteCode?: string
}

export type PublicGuestLookupPayload =
  | { name: string }
  | { name: string; invite_code: string }
  | { lookup_token: string }

export interface PublicGuestLookupResult {
  guestId: string
  eventName: string
  guestName: string
  tableNumber: string
  seatNumber?: string
  seatConfirmationStatus?: SeatConfirmationStatus
}

/** Public autocomplete item — display name only (no guest id). */
export interface GuestNameSuggestion {
  displayName: string
}
