import { useMemo } from 'react'
import type { Guest } from '@/types/guest'
import { createGuestFuse, searchGuests } from '@/lib/fuse'

export function useFuzzySearch(guests: Guest[]) {
  const fuse = useMemo(() => createGuestFuse(guests), [guests])

  const search = (query: string): Guest[] => searchGuests(fuse, query)

  return { search }
}
