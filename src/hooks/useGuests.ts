import { useCallback, useEffect, useState } from 'react'
import type { Guest } from '@/types/guest'
import * as api from '@/lib/api'

export function useGuests(eventId: string | undefined) {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!eventId) {
      setGuests([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await api.getEventGuests(eventId)
      setGuests(data)
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { guests, loading, refresh, setGuests }
}
