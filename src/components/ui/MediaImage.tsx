import { useState } from 'react'
import { resolveMediaUrl } from '@/lib/api/mediaUrl'

interface MediaImageProps {
  src?: string | null
  alt: string
  className?: string
  unavailableMessage?: string
}

export function MediaImage({
  src,
  alt,
  className = '',
  unavailableMessage = 'Image unavailable. Ask your host to upload it again if this keeps happening.',
}: MediaImageProps) {
  const resolved = resolveMediaUrl(src ?? undefined)
  const [failed, setFailed] = useState(false)

  if (!resolved) return null

  if (failed) {
    return (
      <p className="text-sm text-muted text-center py-6 px-4 border border-dashed border-border rounded-sm">
        {unavailableMessage}
      </p>
    )
  }

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  )
}
