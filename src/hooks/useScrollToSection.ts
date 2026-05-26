import { useCallback } from 'react'

export function useScrollToSection() {
  const scrollTo = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return scrollTo
}
