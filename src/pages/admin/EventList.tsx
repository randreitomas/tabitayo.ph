import { useEffect, useState } from 'react'
import { getAllHosts, getAllEvents, approveEvent, rejectEvent, updateEvent } from '@/lib/api'
import type { Event, EventStatus } from '@/types/event'
import type { HostAccount } from '@/types/user'
import { APPROVAL_LABELS, approvalBadgeVariant, formatTierPrice } from '@/lib/eventApproval'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

export function AdminEventList() {
  const [events, setEvents] = useState<Event[]>([])
  const [hosts, setHosts] = useState<HostAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'all'>('pending')
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([getAllEvents(), getAllHosts()])
      .then(([evts, h]) => {
        setEvents(evts)
        setHosts(h)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const hostName = (hostId: string) =>
    hosts.find((h) => h.id === hostId)?.displayName ?? hostId

  const pending = events.filter(
    (e) => e.approvalStatus === 'payment_submitted' || e.approvalStatus === 'pending_payment'
  )

  const displayed =
    filter === 'pending'
      ? events.filter((e) => e.approvalStatus === 'payment_submitted')
      : events

  const setLifecycle = async (eventId: string, status: EventStatus) => {
    await updateEvent(eventId, { status })
    load()
  }

  const handleApprove = async (eventId: string) => {
    await approveEvent(eventId)
    load()
  }

  const handleReject = async (eventId: string) => {
    await rejectEvent(eventId, rejectReason)
    setRejectingId(null)
    setRejectReason('')
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl">All events</h1>
          <p className="text-sm text-muted mt-1">
            Approve events after manual payment is confirmed (GCash / bank transfer).
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'pending' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Pending approval ({pending.filter((e) => e.approvalStatus === 'payment_submitted').length})
          </Button>
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All events
          </Button>
        </div>
      </div>

      {filter === 'pending' && pending.filter((e) => e.approvalStatus === 'pending_payment').length > 0 && (
        <Card padding="sm" className="border-gold/40 bg-gold/10">
          <p className="text-sm text-muted">
            {pending.filter((e) => e.approvalStatus === 'pending_payment').length} event(s) awaiting
            host payment — not yet submitted for review.
          </p>
        </Card>
      )}

      {loading ? (
        <p className="text-muted">Loading events...</p>
      ) : displayed.length === 0 ? (
        <Card>
          <p className="text-sm text-muted text-center py-8">
            {filter === 'pending'
              ? 'No events waiting for payment approval.'
              : 'No events yet.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayed.map((event) => (
            <Card key={event.id} padding="sm">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-heading text-xl">{event.name}</h2>
                    <Badge variant={approvalBadgeVariant(event.approvalStatus)}>
                      {APPROVAL_LABELS[event.approvalStatus]}
                    </Badge>
                    <Badge variant={event.status}>{event.status}</Badge>
                    <Badge>{event.tier}</Badge>
                    <Badge>{formatTierPrice(event.tier)}</Badge>
                  </div>
                  <p className="text-sm text-muted">
                    {event.venue} · {new Date(event.date).toLocaleDateString('en-PH')}
                  </p>
                  <p className="text-xs text-muted">
                    Host: {hostName(event.hostId)}
                    {event.paymentSubmittedAt &&
                      ` · Payment submitted ${new Date(event.paymentSubmittedAt).toLocaleString('en-PH')}`}
                  </p>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  {event.approvalStatus === 'payment_submitted' && (
                    <>
                      <Button size="sm" onClick={() => handleApprove(event.id)}>
                        Approve (payment confirmed)
                      </Button>
                      {rejectingId === event.id ? (
                        <div className="space-y-2 min-w-[200px]">
                          <Input
                            label="Rejection reason"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Optional"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" variant="danger" onClick={() => handleReject(event.id)}>
                              Confirm reject
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setRejectingId(null)
                                setRejectReason('')
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setRejectingId(event.id)}
                        >
                          Reject
                        </Button>
                      )}
                    </>
                  )}

                  {event.approvalStatus === 'approved' && (
                    <div className="flex flex-wrap gap-2">
                      {event.status !== 'ended' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setLifecycle(event.id, 'ended')}
                        >
                          Mark ended
                        </Button>
                      )}
                      <a href={`/e/${event.id}`} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="ghost">
                          Guest page
                        </Button>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
