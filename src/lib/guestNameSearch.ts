import type { Guest } from '@/types/guest'
import { normalizeName } from '@/lib/fuse'

/**
 * MOCK MODE ONLY — used when VITE_USE_MOCK is on (local demo without the API).
 *
 * Production / Vercel guests use the live backend:
 * - GET  /public/events/{token}/guest-suggestions?q=...
 * - POST /public/events/{token}/guest-lookup { name }
 *
 * Last-name and alias matching on deployed sites is handled by the server, not this file.
 */

/** Match rules aligned with public guest-suggestions / guest-lookup (name parts + alias). */
export function guestMatchesNameQuery(guest: Guest, query: string): boolean {
  const needle = normalizeName(query)
  if (!needle) return false

  const full = normalizeName(guest.fullName)
  if (full.includes(needle)) return true

  const alias = guest.alias ? normalizeName(guest.alias) : ''
  if (alias && (alias.includes(needle) || alias.startsWith(needle))) return true

  const parts = full.split(' ').filter(Boolean)
  return parts.some((part) => part.startsWith(needle) || part === needle)
}

export function filterGuestsForSuggestions(
  guests: Guest[],
  query: string,
  limit = 8
): Guest[] {
  const trimmed = query.trim()
  if (!trimmed) return []

  const seen = new Set<string>()
  const matches: Guest[] = []

  for (const guest of guests) {
    if (seen.has(guest.fullName)) continue
    if (!guestMatchesNameQuery(guest, trimmed)) continue
    seen.add(guest.fullName)
    matches.push(guest)
    if (matches.length >= limit) break
  }

  return matches
}

/** Mock guest-lookup: resolve by full name, alias, or name-part query. */
export function findGuestForNameLookup(guests: Guest[], name: string): Guest | undefined {
  const trimmed = name.trim()
  if (!trimmed) return undefined

  const normalized = normalizeName(trimmed)

  const exactFull = guests.find((g) => normalizeName(g.fullName) === normalized)
  if (exactFull) return exactFull

  const exactAlias = guests.find(
    (g) => g.alias && normalizeName(g.alias) === normalized
  )
  if (exactAlias) return exactAlias

  const candidates = guests.filter((g) => guestMatchesNameQuery(g, trimmed))
  if (candidates.length === 1) return candidates[0]

  const lastPartMatches = candidates.filter((g) => {
    const parts = normalizeName(g.fullName).split(' ').filter(Boolean)
    const last = parts[parts.length - 1]
    return last === normalized || last?.startsWith(normalized)
  })
  if (lastPartMatches.length === 1) return lastPartMatches[0]

  return undefined
}
