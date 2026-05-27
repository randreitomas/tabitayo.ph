import type { EventMenu } from '@/types/event'
import { getMenuCourses } from '@/lib/menu'
import { resolveMediaUrl } from '@/lib/api/mediaUrl'

interface MenuDisplayProps {
  menu?: EventMenu
  menuImageUrl?: string
}

export function MenuDisplay({ menu, menuImageUrl }: MenuDisplayProps) {
  const menuSrc = resolveMediaUrl(menuImageUrl)
  if (menuSrc) {
    return (
      <div>
        <h3 className="font-heading text-xl text-center mb-4">Menu</h3>
        <img
          src={menuSrc}
          alt="Event menu"
          className="w-full rounded-sm border border-border object-contain max-h-[28rem] mx-auto"
        />
        <p className="text-xs text-muted text-center mt-2">Pinch to zoom on your device</p>
      </div>
    )
  }

  const courses = getMenuCourses(menu)

  if (courses.length === 0) return null

  return (
    <div>
      <h3 className="font-heading text-xl text-center mb-4">Menu</h3>
      <div className="space-y-5">
        {courses.map((course) => (
          <div key={course.key}>
            <h4 className="font-heading text-lg text-center mb-2 text-dusty-rose">
              {course.label}
            </h4>
            <p className="text-sm whitespace-pre-line text-center text-dark/90 leading-relaxed">
              {course.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
