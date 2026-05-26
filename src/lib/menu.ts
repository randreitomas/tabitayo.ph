import type { Event, EventMenu, MenuDisplayMode } from '@/types/event'

export const MENU_COURSE_LABELS = {
  appetizer: 'Appetizer',
  main: 'Main',
  dessert: 'Dessert',
} as const

export type MenuCourseKey = keyof typeof MENU_COURSE_LABELS

export const EMPTY_MENU: EventMenu = {
  appetizer: '',
  main: '',
  dessert: '',
}

export function sanitizeMenu(menu: EventMenu): EventMenu | undefined {
  const appetizer = menu.appetizer?.trim()
  const main = menu.main?.trim()
  const dessert = menu.dessert?.trim()

  if (!appetizer && !main && !dessert) return undefined

  return {
    ...(appetizer ? { appetizer } : {}),
    ...(main ? { main } : {}),
    ...(dessert ? { dessert } : {}),
  }
}

export function hasAnyMenu(menu?: EventMenu): boolean {
  if (!menu) return false
  return Boolean(menu.appetizer?.trim() || menu.main?.trim() || menu.dessert?.trim())
}

export function getMenuCourses(menu?: EventMenu): { key: MenuCourseKey; label: string; content: string }[] {
  if (!menu) return []

  return (Object.keys(MENU_COURSE_LABELS) as MenuCourseKey[])
    .map((key) => ({
      key,
      label: MENU_COURSE_LABELS[key],
      content: menu[key]?.trim() ?? '',
    }))
    .filter((course) => course.content.length > 0)
}

export function normalizeMenu(menu?: EventMenu): EventMenu {
  return {
    appetizer: menu?.appetizer ?? '',
    main: menu?.main ?? '',
    dessert: menu?.dessert ?? '',
  }
}

export function inferMenuDisplayMode(event: Pick<Event, 'menuDisplayMode' | 'menuImageUrl' | 'menu'>): MenuDisplayMode {
  if (event.menuDisplayMode) return event.menuDisplayMode
  if (event.menuImageUrl) return 'image'
  if (hasAnyMenu(event.menu)) return 'text'
  return 'text'
}

export function hasMenuForGuests(event: Pick<Event, 'menuDisplayMode' | 'menuImageUrl' | 'menu'>): boolean {
  const mode = inferMenuDisplayMode(event)
  if (mode === 'image') return Boolean(event.menuImageUrl)
  return hasAnyMenu(event.menu)
}
