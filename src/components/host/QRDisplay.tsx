import { useEffect, useState } from 'react'
import { getOrCreateEventQrCode } from '@/lib/api'
import { getApiErrorMessage } from '@/lib/api/errors'
import { generateEventQR, getEventGuestUrl } from '@/lib/qr'
import { Button } from '@/components/ui/Button'

interface QRDisplayProps {
  eventId: string
  eventName: string
  /** Preloaded from host event when available */
  initialToken?: string
  initialPayload?: string
}

export function QRDisplay({
  eventId,
  eventName,
  initialToken,
  initialPayload,
}: QRDisplayProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [guestUrl, setGuestUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setError(null)
      try {
        const info = await getOrCreateEventQrCode(eventId)
        const token = info.qrCodeToken || initialToken
        const payload = info.qrCodePayload || initialPayload
        if (!token) throw new Error('QR code not ready')

        const url = getEventGuestUrl(token, payload)
        if (cancelled) return
        setGuestUrl(url)
        const qr = await generateEventQR(token, {
          width: 320,
          qrCodePayload: payload,
        })
        if (!cancelled) setDataUrl(qr)
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, 'Could not load QR code.'))
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [eventId, initialToken, initialPayload])

  const download = () => {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `tabitayo-qr-${eventId}.png`
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
      {guestUrl && (
        <p className="text-xs text-muted text-center break-all">{guestUrl}</p>
      )}
      {error && <p className="text-xs text-red-600 text-center">{error}</p>}
      <Button variant="secondary" onClick={download} disabled={!dataUrl}>
        Download QR
      </Button>
    </div>
  )
}
