import type { Guest, SeatConfirmationStatus } from '@/types/guest'

export function isGuestArrived(guest: Guest): boolean {
  return guest.seatConfirmationStatus === 'seat_found'
}

export function countArrivedGuests(guests: Guest[]): number {
  return guests.filter(isGuestArrived).length
}

export function arrivalStatusLabel(status?: SeatConfirmationStatus): string {
  return status === 'seat_found' ? 'Arrived' : 'Not yet'
}

export function formatArrivedAt(iso?: string): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
