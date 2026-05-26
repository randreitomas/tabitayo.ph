import { useEffect, useState } from 'react'
import { generateEventQR, getEventGuestUrl } from '@/lib/qr'
import { Button } from '@/components/ui/Button'

interface QRDisplayProps {
  eventId: string
  eventName: string
}

export function QRDisplay({ eventId, eventName }: QRDisplayProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const guestUrl = getEventGuestUrl(eventId)

  useEffect(() => {
    generateEventQR(eventId, { width: 320 }).then(setDataUrl)
  }, [eventId])

  const download = () => {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `tabitayo-qr-${eventId}.png`
    a.click()
  }

  return (
    <div className="flex flex-col items-center gap-6 max-w-sm mx-auto text-center">
      <p className="text-sm text-muted">
        Guests scan this code to find their seat at <strong>{eventName}</strong>
      </p>
      {dataUrl ? (
        <img
          src={dataUrl}
          alt={`QR code for ${eventName}`}
          className="w-64 h-64 border border-border rounded-sm p-2 bg-ivory"
        />
      ) : (
        <div className="w-64 h-64 border border-border rounded-sm animate-pulse bg-border/30" />
      )}
      <p className="text-xs text-muted break-all px-4">{guestUrl}</p>
      <div className="flex gap-3">
        <Button onClick={download} disabled={!dataUrl}>
          Download PNG
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigator.clipboard.writeText(guestUrl)}
        >
          Copy link
        </Button>
      </div>
    </div>
  )
}
