import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useEvent } from '@/hooks/useEvent'
import {
  updateEvent,
  deleteEvent,
  getEventPhotos,
  updatePhotoStatus,
  setEventSpotifyPlaylist,
  clearEventSpotifyPlaylist,
} from '@/lib/api'
import { USE_MOCK } from '@/lib/api/config'
import type { PhotoShareItem } from '@/types/event'
import { Tabs } from '@/components/ui/Tabs'

const EVENT_DETAIL_TABS = [
  { id: 'guests', label: 'Guests' },
  { id: 'floor', label: 'Floor Plan' },
  { id: 'menu', label: 'Menu' },
  { id: 'playlist', label: 'Playlist' },
  { id: 'photos', label: 'Photo Share' },
  { id: 'qr', label: 'QR Code' },
] as const
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { FloorPlanEditor } from '@/components/host/FloorPlanEditor'
import { MenuEditor } from '@/components/host/MenuEditor'
import { QRDisplay } from '@/components/host/QRDisplay'
import { EventSetupChecklist } from '@/components/host/EventSetupChecklist'
import { GuestManager } from './GuestManager'
import { EventApprovalBanner } from '@/components/host/EventApprovalBanner'
import {
  APPROVAL_LABELS,
  approvalBadgeVariant,
  canHostPublishQr,
  eventStatusBadgeVariant,
} from '@/lib/eventApproval'
import { spotifyInputHint, toSpotifyPlaylistUrl } from '@/lib/spotify'
import { getApiErrorMessage } from '@/lib/api/errors'

export function EventDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { event, loading, setEvent } = useEvent(id, 'host')
  const [activeTab, setActiveTab] = useState('guests')
  const [photos, setPhotos] = useState<PhotoShareItem[]>([])
  const [spotifyDraft, setSpotifyDraft] = useState('')
  const [spotifyError, setSpotifyError] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    if (event) {
      setSpotifyDraft(event.spotifyUrl ?? '')
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

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'guests':
        return (
          <GuestManager eventId={event.id} guestLookupMode={event.guestLookupMode} />
        )
      case 'floor':
        return <FloorPlanEditor event={event} onUpdated={setEvent} />
      case 'menu':
        return <MenuEditor event={event} onUpdated={setEvent} />
      case 'playlist':
        return (
          <div className="space-y-4 max-w-lg">
            <Input
              label="Spotify playlist link"
              value={spotifyDraft}
              onChange={(e) => {
                setSpotifyDraft(e.target.value)
                setSpotifyError(null)
              }}
              hint={spotifyInputHint()}
              placeholder="https://open.spotify.com/playlist/..."
            />
            {spotifyError && <p className="text-xs text-red-600">{spotifyError}</p>}
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  const playlistUrl = toSpotifyPlaylistUrl(spotifyDraft)
                  if (!playlistUrl) {
                    setSpotifyError(
                      'Could not read a playlist URL. Use Share → Copy link to playlist, or paste only the embed src URL — not the full iframe HTML as the only text without a valid Spotify link.'
                    )
                    return
                  }
                  setSpotifyError(null)
                  try {
                    const updated = await setEventSpotifyPlaylist(event.id, playlistUrl)
                    setEvent(updated)
                    setSpotifyDraft(playlistUrl)
                  } catch (err) {
                    setSpotifyError(
                      getApiErrorMessage(err, 'Could not save playlist. Use a public Spotify playlist link.')
                    )
                  }
                }}
              >
                Save playlist
              </Button>
              {event.spotifyUrl && (
                <Button
                  variant="ghost"
                  onClick={async () => {
                    const updated = await clearEventSpotifyPlaylist(event.id)
                    setEvent(updated)
                    setSpotifyDraft('')
                  }}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        )
      case 'photos':
        return (
          <div className="space-y-4">
            {photoError && <p className="text-xs text-red-600">{photoError}</p>}
            {!USE_MOCK ? (
              <p className="text-muted text-sm">
                Photo share moderation is not available via the API yet. Use mock mode or wait for a
                future release.
              </p>
            ) : !event.photoShareEnabled ? (
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
                          variant="accent"
                          onClick={async () => {
                            try {
                              setPhotoError(null)
                              await updatePhotoStatus(photo.id, 'approved')
                              setPhotos(await getEventPhotos(event.id))
                            } catch (err) {
                              setPhotoError(
                                getApiErrorMessage(err, 'Could not update photo status.')
                              )
                            }
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={async () => {
                            try {
                              setPhotoError(null)
                              await updatePhotoStatus(photo.id, 'rejected')
                              setPhotos(await getEventPhotos(event.id))
                            } catch (err) {
                              setPhotoError(
                                getApiErrorMessage(err, 'Could not update photo status.')
                              )
                            }
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
        )
      case 'qr':
        return canHostPublishQr(event) ? (
          <QRDisplay
            eventId={event.id}
            eventName={event.name}
            initialToken={event.qrCodeToken}
            initialPayload={event.qrCodePayload}
          />
        ) : (
          <p className="text-sm text-muted text-center py-8">
            QR code will be available after your event is approved.
          </p>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <Link to="/host/events" className="text-xs text-muted hover:text-dark">
            ← All events
          </Link>
          <h1 className="font-heading text-3xl md:text-4xl mt-1 text-dark tracking-tight">
            {event.name}
          </h1>
          <p className="text-sm text-muted mt-1">
            {event.venue} · {new Date(event.date).toLocaleDateString('en-PH')}
          </p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <Badge variant={approvalBadgeVariant(event.approvalStatus)}>
              {APPROVAL_LABELS[event.approvalStatus]}
            </Badge>
            <Badge variant={eventStatusBadgeVariant(event.status)}>{event.status}</Badge>
            <Badge>{event.tier}</Badge>
          </div>
          <div className="mt-3">
            <EventSetupChecklist setup={event.setup} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {event.status === 'active' && event.approvalStatus === 'approved' && (
            <Button variant="secondary" size="sm" onClick={() => saveEventPatch({ status: 'ended' })}>
              Mark ended
            </Button>
          )}
          <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
            Delete event
          </Button>
          {canHostPublishQr(event) && (
            <Link
              to={`/e/${event.qrCodeToken ?? event.publicSlug ?? event.id}`}
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="ghost" size="sm">
                Preview guest page
              </Button>
            </Link>
          )}
        </div>
      </div>

      <EventApprovalBanner event={event} onUpdated={setEvent} />

      <Tabs tabs={[...EVENT_DETAIL_TABS]} activeId={activeTab} onChange={setActiveTab}>
        {renderActiveTab()}
      </Tabs>

      <Modal
        open={deleteOpen}
        onClose={() => {
          if (!deleting) {
            setDeleteOpen(false)
            setDeleteError(null)
          }
        }}
        title="Delete event?"
        footer={
          <div className="flex gap-2 justify-end p-4 border-t border-border">
            <Button
              variant="secondary"
              disabled={deleting}
              onClick={() => {
                setDeleteOpen(false)
                setDeleteError(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={deleting}
              onClick={async () => {
                setDeleting(true)
                setDeleteError(null)
                try {
                  await deleteEvent(event.id)
                  navigate('/host/events', { replace: true })
                } catch (err) {
                  setDeleteError(
                    getApiErrorMessage(err, 'Could not delete this event. Try again.')
                  )
                } finally {
                  setDeleting(false)
                }
              }}
            >
              {deleting ? 'Deleting...' : 'Delete event'}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-dark/90 leading-relaxed">
          This removes <strong>{event.name}</strong> from your dashboard and disables the guest
          page and QR code. Guests will no longer be able to look up seats for this event.
        </p>
        {deleteError && <p className="text-xs text-red-600 mt-3">{deleteError}</p>}
      </Modal>
    </div>
  )
}
