import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'
import { createEvent } from '@/lib/api'
import type { CreateEventInput } from '@/types/event'
import { EventForm } from '@/components/host/EventForm'
import { PageHeader } from '@/components/ui/PageHeader'

export function CreateEvent() {
  const { user } = useAuthContext()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data: CreateEventInput) => {
    if (!user) return
    setLoading(true)
    try {
      const event = await createEvent(user.id, data)
      navigate(`/host/events/${event.id}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <PageHeader
        title="Create event"
        description="Set the basics — you can add guests, floor plan, and menu after."
      />
      <EventForm onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
