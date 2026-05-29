import { useCallback, useEffect, useState } from 'react'
import type { Event, PhotoShareItem } from '@/types/event'
import {
  deleteEventPhoto,
  getEventPhotos,
  updatePhotoStatus,
} from '@/lib/api'
import { getApiErrorMessage } from '@/lib/api/errors'
import { MediaImage } from '@/components/ui/MediaImage'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'

type PhotoFilter = 'pending' | 'approved' | 'rejected' | 'all'

const PHOTO_FILTER_TABS: { id: PhotoFilter; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'all', label: 'All' },
]

interface HostPhotoSharePanelProps {
  event: Event
}

export function HostPhotoSharePanel({ event }: HostPhotoSharePanelProps) {
  const [photos, setPhotos] = useState<PhotoShareItem[]>([])
  const [filter, setFilter] = useState<PhotoFilter>('pending')
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadPhotos = useCallback(async () => {
    setLoading(true)
    try {
      setPhotos(await getEventPhotos(event.id))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load photos.'))
    } finally {
      setLoading(false)
    }
  }, [event.id])

  useEffect(() => {
    void loadPhotos()
  }, [loadPhotos])

  const runAction = async (photoId: string, action: () => Promise<unknown>) => {
    setActionId(photoId)
    setError(null)
    try {
      await action()
      await loadPhotos()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not update photo.'))
    } finally {
      setActionId(null)
    }
  }

  if (!event.photoShareEnabled) {
    return <p className="text-muted text-sm">Photo share is disabled for this event.</p>
  }

  const filtered =
    filter === 'all' ? photos : photos.filter((p) => p.status === filter)

  return (
    <div className="space-y-4">
      {error && <p className="text-xs text-red-600">{error}</p>}

      <Tabs tabs={PHOTO_FILTER_TABS} activeId={filter} onChange={(id) => setFilter(id as PhotoFilter)}>
        {loading ? (
          <p className="text-sm text-muted">Loading photos...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted">
            {filter === 'all' ? 'No photos uploaded yet.' : `No ${filter} photos.`}
          </p>
        ) : (
          <ul className="grid sm:grid-cols-2 gap-4">
            {filtered.map((photo) => {
              const busy = actionId === photo.id
              return (
                <li key={photo.id} className="border border-border rounded-sm p-3 space-y-3">
                  <MediaImage
                    src={photo.imageUrl}
                    alt={photo.caption ?? 'Uploaded photo'}
                    className="w-full aspect-video object-cover rounded-sm"
                    unavailableMessage="Photo unavailable (it may have been rejected or removed)."
                  />
                  {photo.caption && (
                    <p className="text-xs text-muted line-clamp-2">{photo.caption}</p>
                  )}
                  <p className="text-[10px] uppercase tracking-wide text-muted">{photo.status}</p>
                  <div className="flex flex-wrap gap-2">
                    {photo.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="accent"
                          disabled={busy}
                          onClick={() =>
                            runAction(photo.id, () =>
                              updatePhotoStatus(event.id, photo.id, 'approved')
                            )
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          disabled={busy}
                          onClick={() =>
                            runAction(photo.id, () =>
                              updatePhotoStatus(event.id, photo.id, 'rejected')
                            )
                          }
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {photo.status === 'rejected' && (
                      <>
                        <Button
                          size="sm"
                          variant="accent"
                          disabled={busy}
                          onClick={() =>
                            runAction(photo.id, () =>
                              updatePhotoStatus(event.id, photo.id, 'approved')
                            )
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={busy}
                          onClick={() =>
                            runAction(photo.id, () =>
                              updatePhotoStatus(event.id, photo.id, 'pending')
                            )
                          }
                        >
                          Move to pending
                        </Button>
                      </>
                    )}
                    {photo.status === 'approved' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busy}
                        onClick={() =>
                          runAction(photo.id, () =>
                            updatePhotoStatus(event.id, photo.id, 'pending')
                          )
                        }
                      >
                        Move to pending
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busy}
                      onClick={() =>
                        runAction(photo.id, () => deleteEventPhoto(event.id, photo.id))
                      }
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Tabs>
    </div>
  )
}
