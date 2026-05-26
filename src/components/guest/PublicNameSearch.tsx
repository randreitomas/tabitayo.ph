import { useCallback, useState } from 'react'
import type { Guest } from '@/types/guest'
import { searchPublicGuest } from '@/lib/api'
import { getApiErrorMessage } from '@/lib/api/errors'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface PublicNameSearchProps {
  publicSlug: string
  onSelect: (guest: Guest) => void
}

export function PublicNameSearch({ publicSlug, onSelect }: PublicNameSearchProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  const handleSearch = useCallback(async () => {
    const name = query.trim()
    if (name.length < 2) return

    setLoading(true)
    setError(null)
    setNotFound(false)

    try {
      const result = await searchPublicGuest(publicSlug, name)
      if (!result) {
        setNotFound(true)
        return
      }
      onSelect(result.guest)
      setQuery('')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Search failed. Try again.'))
    } finally {
      setLoading(false)
    }
  }, [publicSlug, query, onSelect])

  return (
    <div className="space-y-3">
      <Input
        label="Find your name"
        placeholder="Type your full name..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
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
      <Button
        fullWidth
        onClick={() => void handleSearch()}
        disabled={loading || query.trim().length < 2}
      >
        {loading ? 'Searching...' : 'Find my seat'}
      </Button>
      {notFound && (
        <p className="text-sm text-muted text-center py-2">
          No match found. Check spelling or ask an usher for help.
        </p>
      )}
      {error && <p className="text-xs text-red-600 text-center">{error}</p>}
    </div>
  )
}
