import QRCode from 'qrcode'

function guestBaseUrl(): string {
  return typeof window !== 'undefined'
    ? window.location.origin
    : (import.meta.env.VITE_APP_URL ?? 'https://tabitayo.ph')
}

/** Guest page URL uses `public_slug` from the API (falls back to internal id in mock). */
export function getEventGuestUrl(publicSlug: string): string {
  return `${guestBaseUrl()}/e/${publicSlug}`
}

export async function generateEventQR(
  publicSlug: string,
  options?: { width?: number; margin?: number }
): Promise<string> {
  const url = getEventGuestUrl(publicSlug)

  return QRCode.toDataURL(url, {
    width: options?.width ?? 280,
    margin: options?.margin ?? 2,
    color: {
      dark: '#111010',
      light: '#faf7f2',
    },
  })
}
