/** Production API (Render). Used when env vars are missing on Vercel. */
export const RENDER_API_BASE = 'https://tabitayo-backend.onrender.com/api/v1'

/**
 * Mock mode:
 * - Development: on unless VITE_USE_MOCK=false
 * - Production: off unless VITE_USE_MOCK=true (safe default for Vercel deploys)
 */
export const USE_MOCK = import.meta.env.PROD
  ? import.meta.env.VITE_USE_MOCK === 'true'
  : import.meta.env.VITE_USE_MOCK !== 'false'

function resolveApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_URL?.trim()

  if (fromEnv) {
    // Relative /api/v1 only works with the Vite dev proxy — not on Vercel/static hosts
    if (import.meta.env.PROD && fromEnv.startsWith('/')) {
      return RENDER_API_BASE
    }
    return fromEnv
  }

  return import.meta.env.PROD ? RENDER_API_BASE : 'http://localhost:8000/api/v1'
}

export const API_BASE_URL = resolveApiBaseUrl()

export function isMockToken(token: string | null): boolean {
  return Boolean(token?.startsWith('mock-'))
}
