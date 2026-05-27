import { useCallback, useState } from 'react'
import type { GuestLookupMode } from '@/types/event'
import type { PublicGuestLookupResult } from '@/types/guest'
import { publicGuestLookup } from '@/lib/api'
import { getApiErrorMessage } from '@/lib/api/errors'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface PublicGuestLookupProps {
  lookupToken: string
  guestLookupMode: GuestLookupMode
  onResult: (result: PublicGuestLookupResult) => void
}

export function PublicGuestLookup({
  lookupToken,
  guestLookupMode,
  onResult,
}: PublicGuestLookupProps) {
  const [name, setName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [personalToken, setPersonalToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  const handleSearch = useCallback(async () => {
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
        const q = name.trim()
        const code = inviteCode.trim()
        if (q.length < 2 || code.length < 2) return
        payload = { name: q, invite_code: code }
      } else {
        const q = name.trim()
        if (q.length < 2) return
        payload = { name: q }
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
  }, [lookupToken, guestLookupMode, name, inviteCode, personalToken, onResult])

  const canSubmit =
    guestLookupMode === 'personal_token'
      ? personalToken.trim().length >= 4
      : guestLookupMode === 'invite_code'
        ? name.trim().length >= 2 && inviteCode.trim().length >= 2
        : name.trim().length >= 2

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
            placeholder="Type your full name..."
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
          />
          {guestLookupMode === 'invite_code' && (
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
