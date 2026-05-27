import type { Guest } from '@/types/guest'

export interface DuplicateSeatAssignment {
  tableNumber: string
  seatNumber: string
  guests: Guest[]
}

/** Only table + seat pairs with a non-empty seat can collide. */
export function seatAssignmentKey(
  tableNumber: string,
  seatNumber?: string | null
): string | null {
  const table = tableNumber.trim().toLowerCase()
  const seat = (seatNumber ?? '').trim().toLowerCase()
  if (!table || !seat) return null
  return `${table}::${seat}`
}

export function findDuplicateSeatAssignments(guests: Guest[]): DuplicateSeatAssignment[] {
  const byKey = new Map<string, Guest[]>()

  for (const guest of guests) {
    const key = seatAssignmentKey(guest.tableNumber, guest.seatNumber)
    if (!key) continue
    const group = byKey.get(key) ?? []
    group.push(guest)
    byKey.set(key, group)
  }

  const duplicates: DuplicateSeatAssignment[] = []
  for (const group of byKey.values()) {
    if (group.length < 2) continue
    duplicates.push({
      tableNumber: group[0].tableNumber,
      seatNumber: group[0].seatNumber ?? '',
      guests: group,
    })
  }

  return duplicates.sort((a, b) =>
    a.tableNumber.localeCompare(b.tableNumber, undefined, { numeric: true })
  )
}

export function duplicateSeatGuestIds(guests: Guest[]): Set<string> {
  const ids = new Set<string>()
  for (const group of findDuplicateSeatAssignments(guests)) {
    for (const guest of group.guests) {
      ids.add(guest.id)
    }
  }
  return ids
}

export function findDuplicateSeatForAssignment(
  guests: Guest[],
  tableNumber: string,
  seatNumber?: string,
  excludeGuestId?: string
): DuplicateSeatAssignment | null {
  const key = seatAssignmentKey(tableNumber, seatNumber)
  if (!key) return null

  const matches = guests.filter(
    (g) => g.id !== excludeGuestId && seatAssignmentKey(g.tableNumber, g.seatNumber) === key
  )
  if (matches.length === 0) return null

  return {
    tableNumber: tableNumber.trim(),
    seatNumber: (seatNumber ?? '').trim(),
    guests: matches,
  }
}

export function formatDuplicateSeatMessage(group: DuplicateSeatAssignment): string {
  const names = group.guests.map((g) => g.fullName).join(', ')
  return `Table ${group.tableNumber}, Seat ${group.seatNumber} is assigned to more than one guest: ${names}.`
}
