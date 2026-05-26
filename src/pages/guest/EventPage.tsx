import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useEvent } from '@/hooks/useEvent'
import { useGuests } from '@/hooks/useGuests'
import type { Guest } from '@/types/guest'
import { NameSearch } from '@/components/guest/NameSearch'
import { TableBrowse } from '@/components/guest/TableBrowse'
import { SeatResult } from '@/components/guest/SeatResult'
import { EventDetails } from '@/components/guest/EventDetails'
import { LogoFull } from '@/components/logo/LogoFull'
import { isEventGuestLive } from '@/lib/eventApproval'

export function EventPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const { event, loading, error } = useEvent(eventId)
  const { guests, loading: guestsLoading } = useGuests(eventId)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [browseByTable, setBrowseByTable] = useState(false)

  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="font-heading text-2xl text-muted animate-pulse">Loading event...</p>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="text-center py-16 space-y-4">
        <h1 className="font-heading text-3xl">Event not found</h1>
        <p className="text-muted text-sm">Please check your QR code or link with the host.</p>
      </div>
    )
  }

  if (!isEventGuestLive(event)) {
    return (
      <div className="text-center py-16 space-y-4">
        <LogoFull size="lg" className="mb-6" />
        <h1 className="font-heading text-3xl">{event.name}</h1>
        <p className="text-muted text-sm max-w-xs mx-auto">
          {event.status !== 'active'
            ? event.status === 'ended'
              ? 'This event has ended. Thank you for celebrating with us.'
              : 'This event is no longer available.'
            : 'This event is not live yet. Please check back soon or ask your host.'}
        </p>
      </div>
    )
  }

  const accent = event.customBranding?.primaryColor ?? '#e8c4b8'

  return (
    <div className="space-y-8 pb-8">
      <header
        className="text-center py-6 px-4 -mx-4 rounded-sm"
        style={{ backgroundColor: `${accent}33` }}
      >
        <h1 className="font-heading text-3xl md:text-4xl mb-1">{event.name}</h1>
        <p className="text-sm text-muted">
          {new Date(event.date).toLocaleDateString('en-PH', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <p className="text-xs text-muted mt-1">{event.venue}</p>
      </header>

      <section>
        <h2 className="font-heading text-xl text-center mb-4">Find your seat</h2>
        {!guestsLoading && (
          <NameSearch guests={guests} onSelect={setSelectedGuest} />
        )}
      </section>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <button
          type="button"
          onClick={() => setBrowseByTable((v) => !v)}
          className="text-xs text-muted hover:text-dark underline-offset-2 hover:underline"
        >
          {browseByTable ? 'Hide table list' : 'Browse by Table'}
        </button>
        <div className="flex-1 h-px bg-border" />
      </div>

      {browseByTable && !guestsLoading && (
        <TableBrowse guests={guests} onSelect={setSelectedGuest} />
      )}

      {selectedGuest && (
        <section className="pt-2 border-t border-border">
          <SeatResult guest={selectedGuest} onBack={() => setSelectedGuest(null)} />
        </section>
      )}

      <EventDetails event={event} />
    </div>
  )
}
