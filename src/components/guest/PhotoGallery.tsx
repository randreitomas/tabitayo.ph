import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import type { PhotoShareItem } from '@/types/event'
import { getApprovedPhotos, uploadGuestPhoto } from '@/lib/api'
import { Button } from '@/components/ui/Button'

interface PhotoGalleryProps {
  eventId: string
  enabled: boolean
  tier: 'free' | 'standard' | 'premium'
}

export function PhotoGallery({ eventId, enabled, tier }: PhotoGalleryProps) {
  const [photos, setPhotos] = useState<PhotoShareItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!enabled) return
    const data = await getApprovedPhotos(eventId)
    setPhotos(data)
  }, [eventId, enabled])

  useEffect(() => {
    load()
  }, [load])

  const onDrop = useCallback(
    async (files: File[]) => {
      if (tier !== 'premium') {
        setMessage('Photo sharing is a premium feature for this event.')
        return
      }
      const file = files[0]
      if (!file) return
      setUploading(true)
      setMessage(null)
      try {
        await uploadGuestPhoto(eventId, file)
        setMessage('Thank you! Your photo is pending host approval.')
      } catch {
        setMessage('Upload failed. Please try again.')
      } finally {
        setUploading(false)
      }
    },
    [eventId, tier]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    disabled: !enabled || tier !== 'premium' || uploading,
  })

  if (!enabled) return null

  return (
    <div className="space-y-4">
      <h3 className="font-heading text-xl text-center">Shared Moments</h3>

      {photos.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {photos.map((photo) => (
            <figure key={photo.id} className="aspect-square overflow-hidden rounded-sm border border-border">
              <img
                src={photo.imageUrl}
                alt={photo.caption ?? 'Event photo'}
                className="w-full h-full object-cover"
              />
            </figure>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted text-center">No photos yet. Be the first to share!</p>
      )}

      {tier === 'premium' && (
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
            {uploading ? 'Uploading...' : 'Tap to upload a photo'}
          </p>
        </div>
      )}

      {message && <p className="text-xs text-center text-muted">{message}</p>}
      <Button variant="ghost" size="sm" onClick={load} className="mx-auto block">
        Refresh gallery
      </Button>
    </div>
  )
}
