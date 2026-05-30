import { useEffect, useRef, useState } from 'react'
import type { PhotoShareItem } from '@/types/event'
import { USE_MOCK } from '@/lib/api/config'
import {
  fetchAuthenticatedMediaBlobUrl,
  getMediaAssetPath,
  resolveHostPhotoStorageKey,
  resolveMediaUrl,
} from '@/lib/api/mediaUrl'

interface HostPhotoPreviewProps {
  photo: PhotoShareItem
  alt: string
  className?: string
}

export function HostPhotoPreview({ photo, alt, className = '' }: HostPhotoPreviewProps) {
  const [src, setSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const blobUrlRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const revokeBlob = () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
    }

    const load = async () => {
      setLoading(true)
      setFailed(false)
      setSrc(null)
      revokeBlob()

      if (USE_MOCK) {
        const mockSrc = resolveMediaUrl(photo.imageUrl) ?? photo.imageUrl
        if (!cancelled) {
          setSrc(mockSrc)
          setLoading(false)
        }
        return
      }

      const storageKey = resolveHostPhotoStorageKey(photo)
      const publicPath = resolveMediaUrl(photo.imageUrl)

      if (storageKey) {
        try {
          const blobUrl = await fetchAuthenticatedMediaBlobUrl(storageKey, {
            alternatePath:
              publicPath && publicPath !== getMediaAssetPath(storageKey)
                ? publicPath
                : undefined,
          })
          if (cancelled) {
            URL.revokeObjectURL(blobUrl)
            return
          }
          blobUrlRef.current = blobUrl
          setSrc(blobUrl)
          setLoading(false)
          return
        } catch {
          /* fall through to public URL for approved assets */
        }
      }

      if (photo.status === 'approved' && publicPath) {
        if (!cancelled) {
          setSrc(publicPath)
          setLoading(false)
          return
        }
      }

      if (!cancelled) {
        setFailed(true)
        setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
      revokeBlob()
    }
  }, [photo.id, photo.imageUrl, photo.storageKey, photo.status])

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center border border-dashed border-border rounded-sm bg-muted/20 ${className}`}
        aria-busy="true"
      >
        <p className="text-sm text-muted py-6">Loading preview…</p>
      </div>
    )
  }

  if (failed || !src) {
    return (
      <p className="text-sm text-muted text-center py-6 px-4 border border-dashed border-border rounded-sm">
        {photo.status === 'pending'
          ? 'Preview unavailable. You can still approve or reject this upload.'
          : 'Photo unavailable (it may have been rejected or removed).'}
      </p>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (photo.status === 'approved') {
          const fallback = resolveMediaUrl(photo.imageUrl)
          if (fallback && fallback !== src) {
            setSrc(fallback)
            return
          }
        }
        setFailed(true)
      }}
    />
  )
}
