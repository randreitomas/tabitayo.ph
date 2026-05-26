import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadEventFloorPlan, updateEvent } from '@/lib/api'
import type { Event } from '@/types/event'
import { FloorPlan } from '@/components/guest/FloorPlan'
import { Button } from '@/components/ui/Button'

/** Public Canva template gallery — hosts can duplicate and customize */
export const CANVA_FLOOR_PLAN_TEMPLATE_URL =
  'https://www.canva.com/floor-plans/templates/'

interface FloorPlanEditorProps {
  event: Event
  onUpdated: (event: Event) => void
}

export function FloorPlanEditor({ event, onUpdated }: FloorPlanEditorProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0]
      if (!file) return
      setError(null)
      setUploading(true)
      try {
        const updated = await uploadEventFloorPlan(event.id, file)
        onUpdated(updated)
      } catch {
        setError('Upload failed. Use a JPG or PNG under 5 MB.')
      } finally {
        setUploading(false)
      }
    },
    [event.id, onUpdated]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    disabled: uploading,
  })

  const removeFloorPlan = async () => {
    setError(null)
    const updated = await updateEvent(event.id, { floorPlanUrl: undefined })
    onUpdated(updated)
  }

  return (
    <div className="space-y-5 max-w-lg">
      <div className="text-sm space-y-2 border border-border rounded-sm p-4 bg-border/15">
        <p className="font-heading text-base">Need a layout?</p>
        <p className="text-muted text-xs leading-relaxed">
          Start from a free floor plan template on Canva, customize it for your venue, then
          export as JPG or PNG and upload below.
        </p>
        <a
          href={CANVA_FLOOR_PLAN_TEMPLATE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-sm text-dark underline hover:text-dusty-rose"
        >
          Browse Canva floor plan templates →
        </a>
      </div>

      <div
        {...getRootProps()}
        className={[
          'border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-sage bg-sage/10' : 'border-border hover:border-sage/60',
          uploading ? 'opacity-50 pointer-events-none' : '',
        ].join(' ')}
      >
        <input {...getInputProps()} />
        <p className="text-sm font-body">
          {uploading ? 'Uploading...' : 'Drop your floor plan here or tap to browse'}
        </p>
        <p className="text-xs text-muted mt-2">JPG or PNG · max 5 MB</p>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {event.floorPlanUrl && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted uppercase tracking-wide">Current floor plan</p>
            <Button variant="ghost" size="sm" onClick={removeFloorPlan}>
              Remove
            </Button>
          </div>
          <FloorPlan imageUrl={event.floorPlanUrl} eventName={event.name} />
        </div>
      )}
    </div>
  )
}
