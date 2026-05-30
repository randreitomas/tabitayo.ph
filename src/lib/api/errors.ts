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

export function getApiErrorCode(err: unknown): string | undefined {
  if (axios.isAxiosError<ApiErrorBody>(err)) {
    return err.response?.data?.error?.code
  }
  return undefined
}

const PHOTO_UPLOAD_ERROR_MESSAGES: Record<string, string> = {
  photo_share_unavailable:
    'Photo sharing is not available for this event right now.',
  invalid_upload_type: 'Please upload a JPEG, PNG, or WebP image.',
  invalid_upload_content:
    'This file could not be verified as a valid image. Try another photo.',
  upload_too_large: 'This photo is too large. Please use an image under 5 MB.',
  rate_limited: 'Too many uploads. Please wait a moment and try again.',
  not_found: 'This event is not available.',
  consent_required: 'Please confirm you have permission to share this photo.',
}

export function getPhotoUploadErrorMessage(
  err: unknown,
  fallback = 'Upload failed. Please try again.'
): string {
  const code = getApiErrorCode(err)
  if (code && PHOTO_UPLOAD_ERROR_MESSAGES[code]) {
    return PHOTO_UPLOAD_ERROR_MESSAGES[code]
  }
  return getApiErrorMessage(err, fallback)
}
