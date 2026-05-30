import { MediaImage } from '@/components/ui/MediaImage'

interface FloorPlanProps {
  imageUrl?: string
  eventName: string
}

export function FloorPlan({ imageUrl, eventName }: FloorPlanProps) {
  if (!imageUrl) {
    return (
      <p className="text-sm text-muted text-center py-6">
        Floor plan not available for this event.
      </p>
    )
  }

  return (
    <div>
      <h3 className="font-heading text-xl text-center mb-4">Floor Plan</h3>
      <MediaImage
        src={imageUrl}
        alt={`Floor plan for ${eventName}`}
        className="w-full rounded-sm border border-border object-cover max-h-80"
      />
      <p className="text-xs text-muted text-center mt-2">Pinch to zoom on your device</p>
    </div>
  )
}
