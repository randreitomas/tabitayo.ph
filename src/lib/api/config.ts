/** Direct Render URL — use only when backend CORS allows your frontend origin. */
export const RENDER_API_BASE = 'https://tabitayo-backend.onrender.com/api/v1'

/**
 * Mock mode:
 * - Development: on unless VITE_USE_MOCK=false
 * - Production: off unless VITE_USE_MOCK=true
 */
export const USE_MOCK = import.meta.env.PROD
  ? import.meta.env.VITE_USE_MOCK === 'true'
  : import.meta.env.VITE_USE_MOCK !== 'false'

function resolveApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_URL?.trim()
  if (fromEnv) return fromEnv

  // Production default: same-origin path proxied by vercel.json (no CORS)
  if (import.meta.env.PROD) return '/api/v1'

  return 'http://localhost:8000/api/v1'
}

export const API_BASE_URL = resolveApiBaseUrl()

export function isMockToken(token: string | null): boolean {
  return Boolean(token?.startsWith('mock-'))
}
