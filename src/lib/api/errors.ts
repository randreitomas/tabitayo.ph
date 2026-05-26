import axios from 'axios'

export interface ApiErrorBody {
  error?: {
    code?: string
    message?: string
    details?: unknown
  }
}

export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError<ApiErrorBody>(err)) {
    const msg = err.response?.data?.error?.message
    if (msg) return msg

    if (!err.response) {
      if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
        return 'Cannot reach the API. If this persists after redeploy, the server may be waking up (try again in ~30s).'
      }
      return err.message || fallback
    }

    if (err.response?.status === 401) return 'Invalid email or password.'
    if (err.response?.status === 403) return 'You do not have permission to do that.'
    if (err.response?.status === 404) return 'Not found.'
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}

export function isApiNotFound(err: unknown): boolean {
  return (
    axios.isAxiosError(err) &&
    (err.response?.status === 404 || err.response?.data?.error?.code === 'not_found')
  )
}
