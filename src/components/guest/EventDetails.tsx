import type { Event } from '@/types/event'
import { hasAnyMenu } from '@/lib/menu'
import { FloorPlan } from '@/components/guest/FloorPlan'
import { MenuDisplay } from '@/components/guest/MenuDisplay'
import { PhotoGallery } from '@/components/guest/PhotoGallery'

interface EventDetailsProps {
  event: Event
}

export function EventDetails({ event }: EventDetailsProps) {
  const showFloorPlan = Boolean(event.floorPlanUrl)
  const showMenu = hasAnyMenu(event.menu)
  const showPlaylist = Boolean(event.spotifyUrl?.trim())
  const showPhotos = event.photoShareEnabled

  const hasContent = showFloorPlan || showMenu || showPlaylist || showPhotos

  if (!hasContent) return null

  return (
    <section className="space-y-8 pt-2">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <h2 className="font-heading text-xl text-center shrink-0">Event details</h2>
        <div className="flex-1 h-px bg-border" />
      </div>

      {showFloorPlan && (
        <FloorPlan imageUrl={event.floorPlanUrl} eventName={event.name} />
      )}

      {showMenu && <MenuDisplay menu={event.menu} />}

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
