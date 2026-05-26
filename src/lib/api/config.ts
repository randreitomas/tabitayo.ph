/** When true (default), use in-memory mock data. Set VITE_USE_MOCK=false for the real API. */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'
