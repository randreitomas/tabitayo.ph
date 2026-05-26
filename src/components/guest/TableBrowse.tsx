import { useMemo, useState } from 'react'
import type { Guest } from '@/types/guest'

interface TableBrowseProps {
  guests: Guest[]
  onSelect: (guest: Guest) => void
}

export function TableBrowse({ guests, onSelect }: TableBrowseProps) {
  const tables = useMemo(() => {
    const map = new Map<string, Guest[]>()
    for (const g of guests) {
      const key = g.tableNumber
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(g)
    }
    return [...map.entries()].sort((a, b) => {
      const na = parseInt(a[0], 10)
      const nb = parseInt(b[0], 10)
      if (!isNaN(na) && !isNaN(nb)) return na - nb
      return a[0].localeCompare(b[0])
    })
  }, [guests])

  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="space-y-2">
      {tables.map(([tableNum, tableGuests]) => {
        const isOpen = expanded === tableNum
        return (
          <div key={tableNum} className="border border-border rounded-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : tableNum)}
              className="w-full flex items-center justify-between px-4 py-3 bg-border/20 hover:bg-border/40 transition-colors text-left"
            >
              <span className="font-heading text-lg">Table {tableNum}</span>
              <span className="text-xs text-muted">
                {tableGuests.length} guest{tableGuests.length !== 1 ? 's' : ''}{' '}
                <span className="ml-1">{isOpen ? '▲' : '▼'}</span>
              </span>
            </button>
            {isOpen && (
              <ul className="divide-y divide-border">
                {tableGuests.map((guest) => (
                  <li key={guest.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(guest)}
                      className="w-full text-left px-4 py-2.5 hover:bg-dusty-rose/15 transition-colors text-sm"
                    >
                      {guest.fullName}
                      {guest.seatNumber && (
                        <span className="text-muted ml-2">· Seat {guest.seatNumber}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}
