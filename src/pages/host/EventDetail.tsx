import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useEvent } from '@/hooks/useEvent'
import { updateEvent, getEventPhotos, updatePhotoStatus } from '@/lib/api'
import type { PhotoShareItem } from '@/types/event'
import { Tabs, type TabItem } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FloorPlan } from '@/components/guest/FloorPlan'
import { QRDisplay } from '@/components/host/QRDisplay'
import { GuestManager } from './GuestManager'

export function EventDetail() {
  const { id } = useParams<{ id: string }>()
  const { event, loading, setEvent } = useEvent(id)
  const [activeTab, setActiveTab] = useState('guests')
  const [photos, setPhotos] = useState<PhotoShareItem[]>([])
  const [menuDraft, setMenuDraft] = useState('')
  const [spotifyDraft, setSpotifyDraft] = useState('')
  const [floorPlanUrl, setFloorPlanUrl] = useState('')

  useEffect(() => {
    if (event) {
      setMenuDraft(event.menuContent ?? '')
      setSpotifyDraft(event.spotifyUrl ?? '')
      setFloorPlanUrl(event.floorPlanUrl ?? '')
    }
  }, [event])

  useEffect(() => {
    if (!id) return
    getEventPhotos(id).then(setPhotos)
  }, [id, activeTab])

  if (loading || !event) {
    return <p className="text-muted">{loading ? 'Loading...' : 'Event not found'}</p>
  }

  const saveEventPatch = async (patch: Parameters<typeof updateEvent>[1]) => {
    const updated = await updateEvent(event.id, patch)
    setEvent(updated)
  }

  const tabs: TabItem[] = [
    {
      id: 'guests',
      label: 'Guests',
      content: <GuestManager eventId={event.id} />,
    },
    {
      id: 'floor',
      label: 'Floor Plan',
      content: (
        <div className="space-y-4 max-w-lg">
          <Input
            label="Floor plan image URL"
            value={floorPlanUrl}
            onChange={(e) => setFloorPlanUrl(e.target.value)}
          />
          <Button onClick={() => saveEventPatch({ floorPlanUrl: floorPlanUrl || undefined })}>
            Save floor plan
          </Button>
          <FloorPlan imageUrl={floorPlanUrl} eventName={event.name} />
        </div>
      ),
    },
    {
      id: 'menu',
      label: 'Menu',
      content: (
        <div className="space-y-4 max-w-lg">
          <label className="block text-xs text-muted">Menu content (markdown-style)</label>
          <textarea
            className="w-full min-h-40 px-3 py-2 border border-border rounded-sm font-body text-sm"
            value={menuDraft}
            onChange={(e) => setMenuDraft(e.target.value)}
          />
          <Button onClick={() => saveEventPatch({ menuContent: menuDraft })}>Save menu</Button>
        </div>
      ),
    },
    {
      id: 'playlist',
      label: 'Playlist',
      content: (
        <div className="space-y-4 max-w-lg">
          <Input
            label="Spotify embed URL"
            value={spotifyDraft}
            onChange={(e) => setSpotifyDraft(e.target.value)}
            hint="Use the embed URL from Spotify share menu"
          />
          <Button onClick={() => saveEventPatch({ spotifyUrl: spotifyDraft })}>
            Save playlist
          </Button>
        </div>
      ),
    },
    {
      id: 'photos',
      label: 'Photo Share',
      content: (
        <div className="space-y-4">
          {!event.photoShareEnabled ? (
            <p className="text-muted text-sm">Photo share is disabled for this event.</p>
          ) : photos.filter((p) => p.status === 'pending').length === 0 ? (
            <p className="text-muted text-sm">No photos pending approval.</p>
          ) : (
            <ul className="grid sm:grid-cols-2 gap-4">
              {photos
                .filter((p) => p.status === 'pending')
                .map((photo) => (
                  <li key={photo.id} className="border border-border rounded-sm p-3 space-y-3">
                    <img
                      src={photo.imageUrl}
                      alt=""
                      className="w-full aspect-video object-cover rounded-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={async () => {
                          await updatePhotoStatus(photo.id, 'approved')
                          setPhotos(await getEventPhotos(event.id))
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={async () => {
                          await updatePhotoStatus(photo.id, 'rejected')
                          setPhotos(await getEventPhotos(event.id))
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </div>
      ),
    },
    {
      id: 'qr',
      label: 'QR Code',
      content: <QRDisplay eventId={event.id} eventName={event.name} />,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <Link to="/host/events" className="text-xs text-muted hover:text-dark">
            ← All events
          </Link>
          <h1 className="font-heading text-3xl mt-1">{event.name}</h1>
          <p className="text-sm text-muted mt-1">
            {event.venue} · {new Date(event.date).toLocaleDateString('en-PH')}
          </p>
          <div className="flex gap-2 mt-2">
            <Badge variant={event.status}>{event.status}</Badge>
            <Badge>{event.tier}</Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {event.status === 'active' && (
            <Button variant="secondary" size="sm" onClick={() => saveEventPatch({ status: 'ended' })}>
              Mark ended
            </Button>
          )}
          {event.status !== 'archived' && (
            <Button variant="ghost" size="sm" onClick={() => saveEventPatch({ status: 'archived' })}>
              Archive
            </Button>
          )}
          <Link to={`/e/${event.id}`} target="_blank" rel="noreferrer">
            <Button variant="ghost" size="sm">
              Preview guest page
            </Button>
          </Link>
        </div>
      </div>

      <Tabs tabs={tabs} activeId={activeTab} onChange={setActiveTab} />
    </div>
  )
}
