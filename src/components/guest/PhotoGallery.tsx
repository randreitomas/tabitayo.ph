import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import type { PhotoShareItem } from '@/types/event'
import { getApprovedPhotos, uploadGuestPhoto } from '@/lib/api'
import { getApiErrorCode, getPhotoUploadErrorMessage } from '@/lib/api/errors'
import {
  isUploadableImage,
  MAX_PHOTO_UPLOAD_BYTES,
  UPLOADABLE_IMAGE_ACCEPT,
} from '@/lib/fileUpload'
import { GUEST_PHOTO_CONSENT_TEXT } from '@/lib/photoShare'
import { MediaImage } from '@/components/ui/MediaImage'
import { Button } from '@/components/ui/Button'

const MAX_CAPTION_LENGTH = 500
const GALLERY_REFRESH_MS = 30_000

interface PhotoGalleryProps {
  lookupToken: string
  enabled: boolean
}

export function PhotoGallery({ lookupToken, enabled }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<PhotoShareItem[]>([])
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [unavailable, setUnavailable] = useState(false)
  const [consentAcknowledged, setConsentAcknowledged] = useState(false)

  const loadApproved = useCallback(async () => {
    if (!enabled) return
    try {
      const data = await getApprovedPhotos(lookupToken)
      setPhotos(data)
    } catch (err) {
      if (getApiErrorCode(err) === 'photo_share_unavailable') {
        setUnavailable(true)
      }
    }
  }, [lookupToken, enabled])

  useEffect(() => {
    void loadApproved()
  }, [loadApproved])

  useEffect(() => {
    if (!enabled) return

    const onVisible = () => {
      if (document.visibilityState === 'visible') void loadApproved()
    }
    document.addEventListener('visibilitychange', onVisible)
    const interval = window.setInterval(() => void loadApproved(), GALLERY_REFRESH_MS)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.clearInterval(interval)
    }
  }, [enabled, loadApproved])

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0]
      if (!file) return

      if (!consentAcknowledged) {
        setMessage('Please confirm you have permission to share this photo.')
        return
      }
      if (!isUploadableImage(file)) {
        setMessage('Please upload a JPEG, PNG, or WebP image.')
        return
      }
      if (file.size > MAX_PHOTO_UPLOAD_BYTES) {
        setMessage('This photo is too large. Please use an image under 5 MB.')
        return
      }

      setUploading(true)
      setMessage(null)
      try {
        await uploadGuestPhoto(lookupToken, file, caption, true)
        setCaption('')
        setMessage('Photo submitted for review. It will appear here once the host approves it.')
      } catch (err) {
        if (getApiErrorCode(err) === 'photo_share_unavailable') setUnavailable(true)
        setMessage(getPhotoUploadErrorMessage(err))
      } finally {
        setUploading(false)
      }
    },
    [lookupToken, caption, consentAcknowledged]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: UPLOADABLE_IMAGE_ACCEPT,
    maxFiles: 1,
    maxSize: MAX_PHOTO_UPLOAD_BYTES,
    disabled: !enabled || unavailable || uploading || !consentAcknowledged,
  })

  if (!enabled) return null

  if (unavailable) {
    return (
      <div className="space-y-2 text-center">
        <h3 className="font-heading text-xl">Share a moment</h3>
        <p className="text-sm text-muted">
          Photo sharing is not available for this event right now.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {photos.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-heading text-xl text-center">Shared moments</h3>
          <div className="grid grid-cols-2 gap-2">
            {photos.map((photo) => (
              <figure
                key={photo.id}
                className="overflow-hidden rounded-sm border border-border bg-ivory"
              >
                <MediaImage
                  src={photo.imageUrl}
                  alt={photo.caption ?? 'Event photo'}
                  className="w-full aspect-square object-cover"
                />
                {photo.caption && (
                  <figcaption className="px-2 py-1.5 text-[11px] text-muted line-clamp-2">
                    {photo.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="font-heading text-xl text-center">Share a moment</h3>

        {photos.length === 0 && (
          <p className="text-sm text-muted text-center">
            No photos yet. Be the first to share a moment from this event.
          </p>
        )}

        <label className="flex items-start gap-2 cursor-pointer border border-border rounded-sm p-3 bg-border/10">
          <input
            type="checkbox"
            checked={consentAcknowledged}
            onChange={(e) => setConsentAcknowledged(e.target.checked)}
            className="mt-0.5 shrink-0"
          />
          <span className="text-xs text-muted leading-relaxed">{GUEST_PHOTO_CONSENT_TEXT}</span>
        </label>

        <label className="block space-y-1">
          <span className="text-xs text-muted">Caption (optional)</span>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION_LENGTH))}
            maxLength={MAX_CAPTION_LENGTH}
            rows={2}
            placeholder="Add a short note about this photo..."
            className="w-full border border-border rounded-sm px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-dusty-rose"
            disabled={uploading}
          />
          <span className="text-[10px] text-muted block text-right">
            {caption.length}/{MAX_CAPTION_LENGTH}
          </span>
        </label>

        <div
          {...getRootProps()}
          className={[
            'border-2 border-dashed rounded-sm p-6 text-center cursor-pointer transition-colors',
            isDragActive ? 'border-dusty-rose bg-dusty-rose/10' : 'border-border hover:border-dusty-rose/60',
            uploading ? 'opacity-50 pointer-events-none' : '',
          ].join(' ')}
        >
          <input {...getInputProps()} />
          <p className="text-sm text-muted">
            {uploading ? 'Uploading...' : 'Tap to upload a photo (JPEG, PNG, or WebP, max 5 MB)'}
          </p>
        </div>

        {message && (
          <p
            className={[
              'text-xs text-center',
              message.includes('submitted') ? 'text-dark' : 'text-muted',
            ].join(' ')}
          >
            {message}
          </p>
        )}

        <Button variant="ghost" size="sm" onClick={() => void loadApproved()} className="mx-auto block">
          Refresh gallery
        </Button>
      </div>
    </div>
  )
}
