import { resolveMediaUrl } from '@/lib/api/mediaUrl'

interface FloorPlanProps {
  imageUrl?: string
  eventName: string
}

export function FloorPlan({ imageUrl, eventName }: FloorPlanProps) {
  const src = resolveMediaUrl(imageUrl)
  if (!src) {
    return (
      <p className="text-sm text-muted text-center py-6">
        Floor plan not available for this event.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <img
        src={src}
        alt={`Floor plan for ${eventName}`}
        className="w-full rounded-sm border border-border object-cover max-h-80"
      />
      <p className="text-xs text-muted text-center">Pinch to zoom on your device</p>
    </div>
  )
}
