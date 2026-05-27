import QRCode from 'qrcode'

function guestBaseUrl(): string {
  return typeof window !== 'undefined'
    ? window.location.origin
    : (import.meta.env.VITE_APP_URL ?? 'https://tabitayo.ph')
}

/** Full guest page URL from API token or payload path. */
export function getEventGuestUrl(qrCodeToken: string, qrCodePayload?: string): string {
  if (qrCodePayload?.startsWith('http')) return qrCodePayload
  const path = qrCodePayload?.startsWith('/')
    ? qrCodePayload
    : `/e/${qrCodeToken}`
  return `${guestBaseUrl()}${path}`
}

export async function generateEventQR(
  qrCodeToken: string,
  options?: { width?: number; margin?: number; qrCodePayload?: string }
): Promise<string> {
  const url = getEventGuestUrl(qrCodeToken, options?.qrCodePayload)

  return QRCode.toDataURL(url, {
    width: options?.width ?? 280,
    margin: options?.margin ?? 2,
    color: {
      dark: '#111010',
      light: '#faf7f2',
    },
  })
}
