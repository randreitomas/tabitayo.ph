import { useEffect, useState } from 'react'
import type { PublicGuestLookupResult } from '@/types/guest'
import { confirmSeatFound } from '@/lib/api'
import { getApiErrorMessage } from '@/lib/api/errors'
import { Button } from '@/components/ui/Button'

interface SeatResultProps {
  lookupToken: string
  result: PublicGuestLookupResult
  onBack: () => void
}

export function SeatResult({ lookupToken, result, onBack }: SeatResultProps) {
  const [status, setStatus] = useState(result.seatConfirmationStatus)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setStatus(result.seatConfirmationStatus)
    setConfirming(false)
    setError(null)
  }, [result.guestId, result.seatConfirmationStatus])

  const handleConfirm = async () => {
    setConfirming(true)
    setError(null)
    try {
      const updated = await confirmSeatFound(lookupToken, result.guestId)
      setStatus(updated.seatConfirmationStatus)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not confirm. Try again.'))
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="text-center space-y-6">
      <div className="py-6 px-4 border border-dusty-rose/50 rounded-sm bg-dusty-rose/10">
        <p className="text-xs text-muted uppercase tracking-widest mb-2">Welcome</p>
        <h2 className="font-heading text-3xl md:text-4xl text-dark mb-4">{result.guestName}</h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
          <div>
            <p className="text-xs text-muted mb-1">Table</p>
            <p className="font-heading text-5xl text-dark">{result.tableNumber}</p>
          </div>
          {result.seatNumber && (
            <>
              <div className="hidden sm:block w-px h-12 bg-border" />
              <div>
                <p className="text-xs text-muted mb-1">Seat</p>
                <p className="font-heading text-5xl text-dark">{result.seatNumber}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {status === 'seat_found' ? (
        <p className="text-sm text-sage font-body">You&apos;re all set — enjoy the celebration!</p>
      ) : (
        <Button fullWidth onClick={() => void handleConfirm()} disabled={confirming}>
          {confirming ? 'Saving...' : "I've arrived — I found my seat"}
        </Button>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}

      <Button variant="ghost" onClick={onBack} fullWidth>
        Search again
      </Button>
    </div>
  )
}
