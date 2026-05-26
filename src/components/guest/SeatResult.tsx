import type { Guest } from '@/types/guest'
import { Button } from '@/components/ui/Button'

interface SeatResultProps {
  guest: Guest
  onBack: () => void
}

export function SeatResult({ guest, onBack }: SeatResultProps) {
  return (
    <div className="text-center space-y-6">
      <div className="py-6 px-4 border border-dusty-rose/50 rounded-sm bg-dusty-rose/10">
        <p className="text-xs text-muted uppercase tracking-widest mb-2">Welcome</p>
        <h2 className="font-heading text-3xl md:text-4xl text-dark mb-4">{guest.fullName}</h2>
        {guest.alias && (
          <p className="text-sm text-muted mb-4">({guest.alias})</p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <div>
            <p className="text-xs text-muted mb-1">Table</p>
            <p className="font-heading text-5xl text-dark">{guest.tableNumber}</p>
          </div>
          {guest.seatNumber && (
            <>
              <div className="hidden sm:block w-px h-12 bg-border" />
              <div>
                <p className="text-xs text-muted mb-1">Seat</p>
                <p className="font-heading text-5xl text-dark">{guest.seatNumber}</p>
              </div>
            </>
          )}
        </div>
      </div>
      <Button variant="ghost" onClick={onBack} fullWidth>
        Search again
      </Button>
    </div>
  )
}
