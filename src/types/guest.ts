export interface Guest {
  id: string
  eventId: string
  fullName: string
  alias?: string
  tableNumber: string
  seatNumber?: string
}

export interface CreateGuestInput {
  fullName: string
  alias?: string
  tableNumber: string
  seatNumber?: string
}
