import type { Guest } from '@/types/guest'
import { countArrivedGuests } from '@/lib/guestArrival'
import { Button } from '@/components/ui/Button'

interface GuestArrivalSummaryProps {
  guests: Guest[]
  onRefresh: () => void
  refreshing?: boolean
}

export function GuestArrivalSummary({
  guests,
  onRefresh,
  refreshing,
}: GuestArrivalSummaryProps) {
  const arrived = countArrivedGuests(guests)
  const total = guests.length
  const pct = total > 0 ? Math.round((arrived / total) * 100) : 0

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-border rounded-sm bg-border/15">
      <div>
        <p className="text-xs text-muted uppercase tracking-wide mb-1">Arrival check-in</p>
        <p className="font-heading text-2xl text-dark">
          {arrived} <span className="text-muted text-lg font-body">/ {total} arrived</span>
        </p>
        {total > 0 && (
          <p className="text-xs text-muted mt-1">
            {pct}% of guests tapped &ldquo;I found my seat&rdquo; on the guest page
          </p>
        )}
      </div>
      <Button variant="secondary" size="sm" onClick={onRefresh} disabled={refreshing}>
        {refreshing ? 'Refreshing...' : 'Refresh arrivals'}
      </Button>
    </div>
  )
}
