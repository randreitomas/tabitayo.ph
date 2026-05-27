import { RENDER_API_BASE } from './config'

/** Backend may return `/media/event-assets/...` paths — resolve for img/src. */
export function resolveMediaUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  if (url.startsWith('/media/')) {
    return url
  }
  return url
}

/** Origin for media when not using same-origin proxy (e.g. direct Render in dev). */
export function getMediaOrigin(): string {
  if (import.meta.env.PROD) return ''
  return import.meta.env.VITE_MEDIA_ORIGIN ?? RENDER_API_BASE.replace(/\/api\/v1\/?$/, '')
}
