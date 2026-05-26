import { Link, useParams } from 'react-router-dom'
import { useEvent } from '@/hooks/useEvent'
import { QRDisplay } from '@/components/host/QRDisplay'

export function QRPage() {
  const { id } = useParams<{ id: string }>()
  const { event, loading } = useEvent(id, 'host')

  if (loading) return <p className="text-muted">Loading...</p>
  if (!event) return <p className="text-muted">Event not found</p>

  return (
    <div className="space-y-6">
      <Link to={`/host/events/${id}`} className="text-xs text-muted hover:text-dark">
        ← Back to event
      </Link>
      <h1 className="font-heading text-3xl">QR Code</h1>
      <QRDisplay
        publicSlug={event.publicSlug ?? event.id}
        eventName={event.name}
      />
    </div>
  )
}
