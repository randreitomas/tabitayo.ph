import type { Event } from '@/types/event'
import { hasMenuForGuests, inferMenuDisplayMode } from '@/lib/menu'
import { SPOTIFY_EMBED_HEIGHT, toSpotifyEmbedUrl } from '@/lib/spotify'
import { FloorPlan } from '@/components/guest/FloorPlan'
import { MenuDisplay } from '@/components/guest/MenuDisplay'
import { PhotoGallery } from '@/components/guest/PhotoGallery'

interface EventDetailsProps {
  event: Event
  lookupToken: string
}

export function EventDetails({ event, lookupToken }: EventDetailsProps) {
  const showFloorPlan = Boolean(event.floorPlanUrl)
  const showMenu = hasMenuForGuests(event)
  const menuMode = inferMenuDisplayMode(event)
  const spotifyEmbedSrc = event.spotifyUrl ? toSpotifyEmbedUrl(event.spotifyUrl) : null
  const showPlaylist = Boolean(spotifyEmbedSrc)
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

      {showMenu && (
        <MenuDisplay
          menu={menuMode === 'text' ? event.menu : undefined}
          menuImageUrl={menuMode === 'image' ? event.menuImageUrl : undefined}
        />
      )}

      {showPlaylist && (
        <div className="space-y-3">
          <h3 className="font-heading text-xl text-center">Playlist</h3>
          <div
            className="overflow-hidden rounded-sm border border-border"
            style={{ height: SPOTIFY_EMBED_HEIGHT }}
          >
            <iframe
              src={spotifyEmbedSrc!}
              width="100%"
              height={SPOTIFY_EMBED_HEIGHT}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="block w-full border-0"
              style={{ height: SPOTIFY_EMBED_HEIGHT }}
              title="Event playlist"
            />
          </div>
        </div>
      )}

      {showPhotos && (
        <PhotoGallery lookupToken={lookupToken} enabled={event.photoShareEnabled} />
      )}
    </section>
  )
}
