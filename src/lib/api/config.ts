/** When true (default), use in-memory mock data. Set VITE_USE_MOCK=false for the real API. */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

/** Shown in dev UI so you can confirm mock vs live API */
export function getApiModeLabel(): string {
  if (USE_MOCK) return 'Mock data (no backend)'
  if (API_BASE_URL.startsWith('/')) {
    return `Live API via dev proxy → ${import.meta.env.VITE_PROXY_TARGET ?? 'Render'}`
  }
  return `Live API → ${API_BASE_URL}`
}
