import { useEffect, useState } from 'react'
import { generateEventQR, getEventGuestUrl } from '@/lib/qr'
import { Button } from '@/components/ui/Button'

interface QRDisplayProps {
  publicSlug: string
  eventName: string
}

export function QRDisplay({ publicSlug, eventName }: QRDisplayProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const guestUrl = getEventGuestUrl(publicSlug)

  useEffect(() => {
    generateEventQR(publicSlug, { width: 320 }).then(setDataUrl)
  }, [publicSlug])

  const download = () => {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `tabitayo-qr-${publicSlug}.png`
    a.click()
  }

  return (
    <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
      {dataUrl ? (
        <img
          src={dataUrl}
          alt={`QR code for ${eventName}`}
          className="w-full max-w-[320px] border border-border rounded-sm"
        />
      ) : (
        <div className="w-[320px] h-[320px] bg-border/30 animate-pulse rounded-sm" />
      )}
      <p className="text-xs text-muted text-center break-all">{guestUrl}</p>
      <Button variant="secondary" onClick={download} disabled={!dataUrl}>
        Download QR
      </Button>
    </div>
  )
}
