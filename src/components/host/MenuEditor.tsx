import { useEffect, useState } from 'react'
import type { Event, EventMenu } from '@/types/event'
import { EMPTY_MENU, MENU_COURSE_LABELS, normalizeMenu, sanitizeMenu } from '@/lib/menu'
import { Button } from '@/components/ui/Button'

interface MenuEditorProps {
  event: Event
  onSave: (menu: EventMenu | undefined) => Promise<void>
}

export function MenuEditor({ event, onSave }: MenuEditorProps) {
  const [draft, setDraft] = useState<EventMenu>(EMPTY_MENU)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDraft(normalizeMenu(event.menu))
  }, [event.menu])

  const updateCourse = (key: keyof EventMenu, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(sanitizeMenu(draft))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5 max-w-lg">
      <p className="text-xs text-muted leading-relaxed">
        Add each course separately. Empty courses are hidden from guests.
      </p>

      {(Object.keys(MENU_COURSE_LABELS) as (keyof EventMenu)[]).map((key) => (
        <div key={key}>
          <label htmlFor={`menu-${key}`} className="block text-xs text-muted mb-1.5 font-body">
            {MENU_COURSE_LABELS[key]}
          </label>
          <textarea
            id={`menu-${key}`}
            className="w-full min-h-24 px-3 py-2 border border-border rounded-sm font-body text-sm resize-y"
            placeholder={`${MENU_COURSE_LABELS[key]} dishes (optional)`}
            value={draft[key] ?? ''}
            onChange={(e) => updateCourse(key, e.target.value)}
          />
        </div>
      ))}

      <Button onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : 'Save menu'}
      </Button>
    </div>
  )
}
