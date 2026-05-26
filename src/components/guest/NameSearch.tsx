import { useState, useCallback } from 'react'
import type { Guest } from '@/types/guest'
import { useFuzzySearch } from '@/hooks/useFuzzySearch'
import { Input } from '@/components/ui/Input'

interface NameSearchProps {
  guests: Guest[]
  onSelect: (guest: Guest) => void
}

export function NameSearch({ guests, onSelect }: NameSearchProps) {
  const { search } = useFuzzySearch(guests)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Guest[]>([])

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value)
      if (value.trim().length < 2) {
        setResults([])
        return
      }
      setResults(search(value))
    },
    [search]
  )

  return (
    <div className="space-y-3">
      <Input
        label="Find your name"
        placeholder="Type your full name..."
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        autoComplete="name"
        autoFocus
      />
      {results.length > 0 && (
        <ul className="border border-border rounded-sm divide-y divide-border overflow-hidden">
          {results.map((guest) => (
            <li key={guest.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(guest)
                  setQuery('')
                  setResults([])
                }}
                className="w-full text-left px-4 py-3 hover:bg-dusty-rose/20 transition-colors"
              >
                <span className="font-heading text-lg block">{guest.fullName}</span>
                {guest.alias && (
                  <span className="text-xs text-muted">also known as {guest.alias}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      {query.trim().length >= 2 && results.length === 0 && (
        <p className="text-sm text-muted text-center py-2">
          No match found. Try your full name or check the table list below.
        </p>
      )}
    </div>
  )
}
