import type { Guest } from '@/types/guest'
import { arrivalStatusLabel, formatArrivedAt, isGuestArrived } from '@/lib/guestArrival'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

interface GuestTableProps {
  guests: Guest[]
  onDelete?: (guestId: string) => void
}

export function GuestTable({ guests, onDelete }: GuestTableProps) {
  if (guests.length === 0) {
    return <p className="text-sm text-muted py-8 text-center">No guests yet. Add manually or upload CSV.</p>
  }

  return (
    <div className="overflow-x-auto border border-border rounded-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-border/20 text-left">
            <th className="px-3 py-2 font-body text-xs text-muted">Full name</th>
            <th className="px-3 py-2 font-body text-xs text-muted">Alias</th>
            <th className="px-3 py-2 font-body text-xs text-muted">Table</th>
            <th className="px-3 py-2 font-body text-xs text-muted">Seat</th>
            <th className="px-3 py-2 font-body text-xs text-muted">Arrival</th>
            {onDelete && <th className="px-3 py-2 w-16" />}
          </tr>
        </thead>
        <tbody>
          {guests.map((g) => {
            const arrived = isGuestArrived(g)
            const arrivedAt = formatArrivedAt(g.seatConfirmedAt)

            return (
              <tr key={g.id} className="border-b border-border last:border-0">
                <td className="px-3 py-2">{g.fullName}</td>
                <td className="px-3 py-2 text-muted">{g.alias ?? '—'}</td>
                <td className="px-3 py-2">{g.tableNumber}</td>
                <td className="px-3 py-2">{g.seatNumber ?? '—'}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-col gap-0.5">
                    <Badge variant={arrived ? 'approved' : 'pending'}>
                      {arrivalStatusLabel(g.seatConfirmationStatus)}
                    </Badge>
                    {arrived && arrivedAt && (
                      <span className="text-[10px] text-muted">{arrivedAt}</span>
                    )}
                  </div>
                </td>
                {onDelete && (
                  <td className="px-3 py-2">
                    <Button variant="ghost" size="sm" onClick={() => onDelete(g.id)}>
                      Remove
                    </Button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
