import { useCallback, useEffect, useState } from 'react'
import type { Event } from '@/types/event'
import * as api from '@/lib/api'

export function useEvent(eventId: string | undefined, scope: 'public' | 'host' = 'public') {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!eventId) {
      setEvent(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data =
        scope === 'host'
          ? await api.getHostEvent(eventId)
          : await api.getEvent(eventId)
      if (!data) setError('Event not found')
      setEvent(data)
    } catch {
      setError('Failed to load event')
      setEvent(null)
    } finally {
      setLoading(false)
    }
  }, [eventId, scope])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { event, loading, error, refresh, setEvent }
}
