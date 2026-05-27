import { useEffect, useState } from 'react'
import type { Guest, GuestNameSuggestion } from '@/types/guest'
import { getPublicGuestSuggestions } from '@/lib/api'
import { createGuestFuse, searchGuests } from '@/lib/fuse'

const DEBOUNCE_MS = 280
const MIN_QUERY_LENGTH = 2

interface UseGuestNameSuggestionsOptions {
  lookupToken: string
  query: string
  enabled: boolean
  /** When set, suggestions are computed locally (mock mode). */
  mockGuests?: Guest[]
}

export function useGuestNameSuggestions({
  lookupToken,
  query,
  enabled,
  mockGuests,
}: UseGuestNameSuggestionsOptions) {
  const [suggestions, setSuggestions] = useState<GuestNameSuggestion[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setSuggestions([])
      setLoading(false)
      return
    }

    const trimmed = query.trim()
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions([])
      setLoading(false)
      return
    }

    if (mockGuests) {
      const fuse = createGuestFuse(mockGuests)
      const matches = searchGuests(fuse, trimmed)
      const seen = new Set<string>()
      const items: GuestNameSuggestion[] = []
      for (const guest of matches) {
        if (seen.has(guest.fullName)) continue
        seen.add(guest.fullName)
        items.push({ displayName: guest.fullName })
      }
      setSuggestions(items)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    const timer = window.setTimeout(() => {
      void getPublicGuestSuggestions(lookupToken, trimmed)
        .then((items) => {
          if (!cancelled) setSuggestions(items)
        })
        .catch(() => {
          if (!cancelled) setSuggestions([])
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, DEBOUNCE_MS)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [lookupToken, query, enabled, mockGuests])

  return { suggestions, loading }
}
