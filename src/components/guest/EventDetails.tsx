import type { Event } from '@/types/event'
import { FloorPlan } from '@/components/guest/FloorPlan'
import { PhotoGallery } from '@/components/guest/PhotoGallery'

interface EventDetailsProps {
  event: Event
}

export function EventDetails({ event }: EventDetailsProps) {
  const showMenu = Boolean(event.menuContent)
  const showPlaylist = Boolean(event.spotifyUrl)
  const showPhotos = event.photoShareEnabled

  const hasContent =
    event.floorPlanUrl || showMenu || showPlaylist || showPhotos

  if (!hasContent) return null

  return (
    <section className="space-y-8 pt-2">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <h2 className="font-heading text-xl text-center shrink-0">Event details</h2>
        <div className="flex-1 h-px bg-border" />
      </div>

      <FloorPlan imageUrl={event.floorPlanUrl} eventName={event.name} />

      {showMenu && (
        <div>
          <h3 className="font-heading text-xl text-center mb-3">Menu</h3>
          <div className="text-sm whitespace-pre-line text-center text-dark/90 leading-relaxed">
            {event.menuContent!.replace(/\*\*(.*?)\*\*/g, '$1')}
          </div>
        </div>
      )}

      {showPlaylist && (
        <div>
          <h3 className="font-heading text-xl text-center mb-3">Playlist</h3>
          <iframe
            src={event.spotifyUrl}
            width="100%"
            height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-sm border border-border"
            title="Event playlist"
          />
        </div>
      )}

      {showPhotos && (
        <PhotoGallery eventId={event.id} enabled={event.photoShareEnabled} tier={event.tier} />
      )}
    </section>
  )
}
