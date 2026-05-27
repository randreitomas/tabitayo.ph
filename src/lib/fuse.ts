import Fuse from 'fuse.js'
import type { Guest } from '@/types/guest'

/** Normalize Filipino names for better matching */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\bma\.\s*/gi, 'maria ')
    .replace(/\bma\s+/gi, 'maria ')
    .replace(/[-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function createGuestFuse(guests: Guest[]): Fuse<Guest> {
  return new Fuse(guests, {
    keys: [
      { name: 'fullName', weight: 0.7 },
      { name: 'alias', weight: 0.3 },
      {
        name: 'searchNormalized',
        weight: 0.5,
        getFn: (guest) => normalizeName(guest.fullName),
      },
      {
        name: 'lastName',
        weight: 0.55,
        getFn: (guest) => {
          const parts = normalizeName(guest.fullName).split(' ').filter(Boolean)
          return parts[parts.length - 1] ?? ''
        },
      },
    ],
    threshold: 0.35,
    distance: 100,
    includeScore: true,
    ignoreLocation: true,
    minMatchCharLength: 2,
  })
}

export function searchGuests(fuse: Fuse<Guest>, query: string): Guest[] {
  const trimmed = query.trim()
  if (!trimmed) return []

  const normalizedQuery = normalizeName(trimmed)
  const results = fuse.search(normalizedQuery, { limit: 8 })

  return results.map((r) => r.item)
}
