import { useEffect, useState } from 'react'
import { getAllEvents, updateEvent } from '@/lib/api'
import type { Event, EventStatus } from '@/types/event'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function AdminEventList() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => getAllEvents().then(setEvents).finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  const setStatus = async (eventId: string, status: EventStatus) => {
    await updateEvent(eventId, { status })
    load()
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl">All events</h1>

      {loading ? (
        <p className="text-muted">Loading events...</p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.id} padding="sm">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-heading text-xl">{event.name}</h2>
                    <Badge variant={event.status}>{event.status}</Badge>
                    <Badge>{event.tier}</Badge>
                  </div>
                  <p className="text-sm text-muted">
                    {event.venue} · {new Date(event.date).toLocaleDateString('en-PH')}
                  </p>
                  <p className="text-xs text-muted">Host ID: {event.hostId}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.status !== 'active' && (
                    <Button size="sm" onClick={() => setStatus(event.id, 'active')}>
                      Set active
                    </Button>
                  )}
                  {event.status !== 'ended' && (
                    <Button size="sm" variant="secondary" onClick={() => setStatus(event.id, 'ended')}>
                      Mark ended
                    </Button>
                  )}
                  {event.status !== 'archived' && (
                    <Button size="sm" variant="ghost" onClick={() => setStatus(event.id, 'archived')}>
                      Archive
                    </Button>
                  )}
                  <a href={`/e/${event.id}`} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="ghost">
                      Guest page
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
