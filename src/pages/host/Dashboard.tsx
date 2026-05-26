import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { getHostEvents } from '@/lib/api'
import type { Event } from '@/types/event'
import { APPROVAL_LABELS, approvalBadgeVariant } from '@/lib/eventApproval'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function HostDashboard() {
  const { user } = useAuthContext()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getHostEvents(user.id).then(setEvents).finally(() => setLoading(false))
  }, [user])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="font-heading text-3xl">Your events</h1>
        <Link to="/host/events/new">
          <Button>Create event</Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-muted">Loading events...</p>
      ) : events.length === 0 ? (
        <Card>
          <p className="text-muted text-center py-8">No events yet. Create your first event.</p>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <li key={event.id}>
              <Link to={`/host/events/${event.id}`}>
                <Card className="hover:border-dusty-rose/60 transition-colors h-full">
                  <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                    <h2 className="font-heading text-xl">{event.name}</h2>
                    <div className="flex gap-1 flex-wrap">
                      <Badge variant={approvalBadgeVariant(event.approvalStatus)}>
                        {APPROVAL_LABELS[event.approvalStatus]}
                      </Badge>
                      <Badge variant={event.status}>{event.status}</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted">
                    {new Date(event.date).toLocaleDateString('en-PH')} · {event.venue}
                  </p>
                  <p className="text-xs text-muted mt-2 capitalize">Tier: {event.tier}</p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
