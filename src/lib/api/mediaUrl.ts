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

/** Strip wrappers so API keys map to `/media/event-assets/{key}`. */
export function normalizeEventAssetStorageKey(raw: string): string {
  let key = raw.trim()
  if (key.startsWith('/media/event-assets/')) {
    key = key.slice('/media/event-assets/'.length)
  } else if (key.startsWith('media/event-assets/')) {
    key = key.slice('media/event-assets/'.length)
  } else if (key.startsWith('event-assets/')) {
    key = key.slice('event-assets/'.length)
  }
  return key.replace(/^\/+/, '')
}

/** Same-origin path for `/media/event-assets/{storage_key}` (see OpenAPI). */
export function getMediaAssetPath(storageKeyOrUrl: string): string {
  const trimmed = storageKeyOrUrl.trim()
  if (trimmed.startsWith('/media/')) return trimmed
  const key = normalizeEventAssetStorageKey(trimmed)
  const encoded = key.split('/').map(encodeURIComponent).join('/')
  return `/media/event-assets/${encoded}`
}

/** Resolve storage key for host moderation previews. */
export function resolveHostPhotoStorageKey(photo: {
  storageKey?: string | null
  imageUrl?: string | null
}): string | undefined {
  if (photo.storageKey?.trim()) {
    return normalizeEventAssetStorageKey(photo.storageKey)
  }
  const resolved = resolveMediaUrl(photo.imageUrl)
  if (!resolved) return undefined
  const match = resolved.match(/\/media\/event-assets\/([^?#]+)/)
  if (!match?.[1]) return undefined
  try {
    return decodeURIComponent(match[1])
  } catch {
    return match[1]
  }
}

const TOKEN_KEY = 'tabitayo_token'

function isImageResponse(response: Response, blob: Blob): boolean {
  const contentType = response.headers.get('content-type') ?? blob.type
  if (contentType.includes('application/json')) return false
  if (contentType.startsWith('image/')) return true
  return blob.size > 0 && (blob.type === '' || blob.type.startsWith('image/'))
}

/**
 * Load event asset bytes with host auth. Public `/media/*` only serves approved photos;
 * hosts must fetch pending/rejected previews with Authorization.
 */
export async function fetchAuthenticatedMediaBlobUrl(
  storageKeyOrUrl: string,
  options?: { alternatePath?: string }
): Promise<string> {
  const token = localStorage.getItem(TOKEN_KEY)
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}

  const paths = [
    getMediaAssetPath(storageKeyOrUrl),
    options?.alternatePath?.trim(),
  ].filter((path): path is string => Boolean(path))
  const uniquePaths = [...new Set(paths)]

  let lastError: Error | null = null

  for (const path of uniquePaths) {
    try {
      const response = await fetch(path, { headers, cache: 'no-store' })
      if (!response.ok) {
        lastError = new Error(`Media request failed (${response.status})`)
        continue
      }
      const blob = await response.blob()
      if (!isImageResponse(response, blob)) {
        lastError = new Error('Media response was not an image')
        continue
      }
      return URL.createObjectURL(blob)
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Media fetch failed')
    }
  }

  throw lastError ?? new Error('Media fetch failed')
}
