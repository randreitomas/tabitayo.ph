import { useCallback, useState } from 'react'
import type { GuestLookupMode } from '@/types/event'
import type { Guest, PublicGuestLookupResult } from '@/types/guest'
import { publicGuestLookup } from '@/lib/api'
import { getApiErrorMessage } from '@/lib/api/errors'
import { useGuestNameSuggestions } from '@/hooks/useGuestNameSuggestions'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface PublicGuestLookupProps {
  lookupToken: string
  guestLookupMode: GuestLookupMode
  onResult: (result: PublicGuestLookupResult) => void
  /** Local guest list for mock-mode autocomplete. */
  mockGuests?: Guest[]
}

const MIN_SUGGESTION_QUERY_LENGTH = 1

function SuggestionList({
  suggestions,
  loading,
  query,
  onSelect,
}: {
  suggestions: { displayName: string }[]
  loading: boolean
  query: string
  onSelect: (displayName: string) => void
}) {
  const trimmed = query.trim()

  if (trimmed.length < MIN_SUGGESTION_QUERY_LENGTH) {
    return null
  }

  if (loading && suggestions.length === 0) {
    return <p className="text-xs text-muted text-center py-2">Finding names...</p>
  }

  if (suggestions.length > 0) {
    return (
      <ul
        className="border border-border rounded-sm divide-y divide-border overflow-hidden"
        role="listbox"
        aria-label="Name suggestions"
      >
        {suggestions.map((item) => (
          <li key={item.displayName} role="option">
            <button
              type="button"
              onClick={() => onSelect(item.displayName)}
              className="w-full text-left px-4 py-3 hover:bg-dusty-rose/20 transition-colors"
            >
              <span className="font-heading text-lg block">{item.displayName}</span>
            </button>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <p className="text-sm text-muted text-center py-2">
      No matching names. Check spelling or ask an usher for help.
    </p>
  )
}

export function PublicGuestLookup({
  lookupToken,
  guestLookupMode,
  onResult,
  mockGuests,
}: PublicGuestLookupProps) {
  const [name, setName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [personalToken, setPersonalToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  const usesNameSuggestions =
    guestLookupMode === 'name_only' || guestLookupMode === 'invite_code'

  const { suggestions, loading: suggestionsLoading } = useGuestNameSuggestions({
    lookupToken,
    query: name,
    enabled: usesNameSuggestions,
    mockGuests,
  })

  /** Final seat assignment — POST guest-lookup with canonical or typed name. */
  const runLookup = useCallback(
    async (lookupName?: string) => {
      setLoading(true)
      setError(null)
      setNotFound(false)

      try {
        let payload:
          | { name: string }
          | { name: string; invite_code: string }
          | { lookup_token: string }

        if (guestLookupMode === 'personal_token') {
          const token = personalToken.trim()
          if (token.length < 4) return
          payload = { lookup_token: token }
        } else if (guestLookupMode === 'invite_code') {
          const guestName = (lookupName ?? name).trim()
          const code = inviteCode.trim()
          if (guestName.length < 1 || code.length < 2) return
          payload = { name: guestName, invite_code: code }
        } else {
          const guestName = (lookupName ?? name).trim()
          if (guestName.length < 1) return
          payload = { name: guestName }
        }

        const result = await publicGuestLookup(lookupToken, payload)
        if (!result) {
          setNotFound(true)
          return
        }
        onResult(result)
        setName('')
        setInviteCode('')
        setPersonalToken('')
      } catch (err) {
        setError(getApiErrorMessage(err, 'Search failed. Try again.'))
      } finally {
        setLoading(false)
      }
    },
    [lookupToken, guestLookupMode, name, inviteCode, personalToken, onResult]
  )

  const handleSearch = useCallback(() => {
    void runLookup()
  }, [runLookup])

  const handlePickSuggestion = useCallback(
    (displayName: string) => {
      setName(displayName)
      setNotFound(false)
      setError(null)

      if (guestLookupMode === 'name_only') {
        void runLookup(displayName)
        return
      }

      if (guestLookupMode === 'invite_code' && inviteCode.trim().length >= 2) {
        void runLookup(displayName)
      }
    },
    [guestLookupMode, inviteCode, runLookup]
  )

  const canSubmit =
    guestLookupMode === 'personal_token'
      ? personalToken.trim().length >= 4
      : guestLookupMode === 'invite_code'
        ? name.trim().length >= 1 && inviteCode.trim().length >= 2
        : name.trim().length >= 1

  return (
    <div className="space-y-3">
      {guestLookupMode === 'personal_token' ? (
        <Input
          label="Your personal code"
          placeholder="From your invitation..."
          value={personalToken}
          onChange={(e) => {
            setPersonalToken(e.target.value)
            setNotFound(false)
            setError(null)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              void handleSearch()
            }
          }}
          autoComplete="off"
          autoFocus
        />
      ) : (
        <>
          <Input
            label={guestLookupMode === 'invite_code' ? 'Your name' : 'Find your name'}
            placeholder="First name, last name, or nickname..."
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setNotFound(false)
              setError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                void handleSearch()
              }
            }}
            autoComplete="name"
            autoFocus
            aria-autocomplete="list"
            aria-controls="guest-name-suggestions"
          />

          <div id="guest-name-suggestions">
            <SuggestionList
              suggestions={suggestions}
              loading={suggestionsLoading}
              query={name}
              onSelect={handlePickSuggestion}
            />
          </div>

          {guestLookupMode === 'invite_code' && (
            <>
              <Input
                label="Invite code"
                placeholder="Code on your invitation"
                value={inviteCode}
                onChange={(e) => {
                  setInviteCode(e.target.value.toUpperCase())
                  setNotFound(false)
                  setError(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    void handleSearch()
                  }
                }}
                autoComplete="off"
              />
              <p className="text-xs text-muted text-center">
                Pick your name from the list, then enter your invite code and tap Find my seat.
              </p>
            </>
          )}
        </>
      )}

      <Button fullWidth onClick={() => void handleSearch()} disabled={loading || !canSubmit}>
        {loading ? 'Searching...' : 'Find my seat'}
      </Button>
      {notFound && (
        <p className="text-sm text-muted text-center py-2">
          No match found. Check your details or ask an usher for help.
        </p>
      )}
      {error && <p className="text-xs text-red-600 text-center">{error}</p>}
    </div>
  )
}
