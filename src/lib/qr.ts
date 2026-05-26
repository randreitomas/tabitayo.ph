import QRCode from 'qrcode'

export async function generateEventQR(
  eventId: string,
  options?: { width?: number; margin?: number }
): Promise<string> {
  const base =
    typeof window !== 'undefined'
      ? window.location.origin
      : import.meta.env.VITE_APP_URL ?? 'https://tabitayo.ph'

  const url = `${base}/e/${eventId}`

  return QRCode.toDataURL(url, {
    width: options?.width ?? 280,
    margin: options?.margin ?? 2,
    color: {
      dark: '#111010',
      light: '#faf7f2',
    },
  })
}

export function getEventGuestUrl(eventId: string): string {
  const base =
    typeof window !== 'undefined'
      ? window.location.origin
      : import.meta.env.VITE_APP_URL ?? 'https://tabitayo.ph'
  return `${base}/e/${eventId}`
}
