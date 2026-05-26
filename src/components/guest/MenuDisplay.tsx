import type { EventMenu } from '@/types/event'
import { getMenuCourses } from '@/lib/menu'

interface MenuDisplayProps {
  menu?: EventMenu
}

export function MenuDisplay({ menu }: MenuDisplayProps) {
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
