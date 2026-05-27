import { useEffect, useState } from 'react'
import type { Guest, GuestNameSuggestion } from '@/types/guest'
import { getPublicGuestSuggestions } from '@/lib/api'
import { filterGuestsForSuggestions } from '@/lib/guestNameSearch'

const DEBOUNCE_MS = 280
/** API accepts q from 1 character; supports last-name-first typing. */
const MIN_QUERY_LENGTH = 1

interface UseGuestNameSuggestionsOptions {
  lookupToken: string
  query: string
  enabled: boolean
  /** When set (mock mode only), suggestions are computed in-browser instead of the API. */
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
      setSuggestions(
        filterGuestsForSuggestions(mockGuests, trimmed).map((guest) => ({
          displayName: guest.fullName,
        }))
      )
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
