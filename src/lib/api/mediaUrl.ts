import { RENDER_API_BASE } from './config'

/** Origins we rewrite to same-origin `/media/*` (Vite / Vercel proxy). */
const BACKEND_MEDIA_ORIGINS = [
  'https://tabitayo-backend.onrender.com',
  'http://tabitayo-backend.onrender.com',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
]

function isBackendMediaUrl(url: URL): boolean {
  const origin = url.origin.toLowerCase()
  return BACKEND_MEDIA_ORIGINS.some((o) => origin === o) && url.pathname.startsWith('/media/')
}

/**
 * Resolve menu/floor-plan URLs for `<img src>`.
 * Always prefer same-origin `/media/...` so Vercel/Vite proxy serves files reliably.
 * Full Render URLs in API responses often break after the service sleeps or restarts.
 */
export function resolveMediaUrl(url: string | undefined | null): string | undefined {
  if (!url?.trim()) return undefined
  const trimmed = url.trim()

  if (trimmed.startsWith('data:')) return trimmed

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed)
      if (isBackendMediaUrl(parsed)) {
        return parsed.pathname + parsed.search
      }
      return trimmed
    } catch {
      return trimmed
    }
  }

  if (trimmed.startsWith('/media/')) return trimmed

  const key = trimmed.replace(/^\/+/, '')
  return `/media/event-assets/${key}`
}

/** Origin for media when not using same-origin proxy (e.g. direct Render in dev). */
export function getMediaOrigin(): string {
  if (import.meta.env.PROD) return ''
  return import.meta.env.VITE_MEDIA_ORIGIN ?? RENDER_API_BASE.replace(/\/api\/v1\/?$/, '')
}
