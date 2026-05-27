import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import type { Event, EventMenu, MenuDisplayMode } from '@/types/event'
import {
  EMPTY_MENU,
  MENU_COURSE_LABELS,
  inferMenuDisplayMode,
  normalizeMenu,
  sanitizeMenu,
} from '@/lib/menu'
import { uploadEventMenuImage, updateEvent, deleteEventMenu } from '@/lib/api'
import { getApiErrorMessage } from '@/lib/api/errors'
import { MediaImage } from '@/components/ui/MediaImage'
import { UPLOADABLE_IMAGE_ACCEPT } from '@/lib/fileUpload'
import { Button } from '@/components/ui/Button'

/** Public Canva template gallery — hosts can duplicate and customize */
export const CANVA_MENU_TEMPLATE_URL = 'https://www.canva.com/menus/templates/'

interface MenuEditorProps {
  event: Event
  onUpdated: (event: Event) => void
}

export function MenuEditor({ event, onUpdated }: MenuEditorProps) {
  const [mode, setMode] = useState<MenuDisplayMode>(() => inferMenuDisplayMode(event))
  const [draft, setDraft] = useState<EventMenu>(EMPTY_MENU)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMode(inferMenuDisplayMode(event))
    setDraft(normalizeMenu(event.menu))
  }, [event])

  const selectMode = (next: MenuDisplayMode) => {
    setError(null)
    setMode(next)
    if (next === 'text') {
      setDraft(normalizeMenu(event.menu))
    }
  }

  const updateCourse = (key: keyof EventMenu, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveCourses = async () => {
    setError(null)
    setSaving(true)
    try {
      const updated = await updateEvent(event.id, {
        menuDisplayMode: 'text',
        menu: sanitizeMenu(draft),
        menuImageUrl: undefined,
      })
      onUpdated(updated)
      setMode('text')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save menu. Try again.'))
    } finally {
      setSaving(false)
    }
  }

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0]
      if (!file) return
      setError(null)
      setUploading(true)
      try {
        const updated = await uploadEventMenuImage(event.id, file)
        onUpdated(updated)
        setMode('image')
      } catch (err) {
        setError(
          getApiErrorMessage(err, 'Upload failed. Use a JPG, PNG, or WebP image under 5 MB.')
        )
      } finally {
        setUploading(false)
      }
    },
    [event.id, onUpdated]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: UPLOADABLE_IMAGE_ACCEPT,
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    disabled: uploading,
  })

  const removeMenuImage = async () => {
    setError(null)
    try {
      const updated = await deleteEventMenu(event.id)
      onUpdated(updated)
      setMode('text')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not remove menu image.'))
    }
  }

  return (
    <div className="space-y-5 max-w-lg">
      <p className="text-xs text-muted leading-relaxed">
        Choose how guests see your menu — typed courses or one uploaded image. Only one
        option is shown on the guest page.
      </p>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => selectMode('text')}
          className={[
            'px-3 py-2.5 text-sm font-body rounded-sm border transition-colors',
            mode === 'text'
              ? 'border-dark bg-dark text-ivory'
              : 'border-border bg-ivory text-dark hover:border-sage/60',
          ].join(' ')}
        >
          Type courses
        </button>
        <button
          type="button"
          onClick={() => selectMode('image')}
          className={[
            'px-3 py-2.5 text-sm font-body rounded-sm border transition-colors',
            mode === 'image'
              ? 'border-dark bg-dark text-ivory'
              : 'border-border bg-ivory text-dark hover:border-sage/60',
          ].join(' ')}
        >
          Upload image
        </button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {mode === 'text' ? (
        <div className="space-y-5">
          <p className="text-xs text-muted leading-relaxed">
            Add appetizer, main, and dessert separately. Empty courses are hidden from guests.
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

          <Button onClick={() => void handleSaveCourses()} disabled={saving}>
            {saving ? 'Saving...' : 'Save menu'}
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="text-sm space-y-2 border border-border rounded-sm p-4 bg-border/15">
            <p className="font-heading text-base">Need a layout?</p>
            <p className="text-muted text-xs leading-relaxed">
              Start from a free menu template on Canva, customize it for your event, then
              export as JPG, PNG, or WebP and upload below.
            </p>
            <a
              href={CANVA_MENU_TEMPLATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex text-sm text-dark underline hover:text-dusty-rose"
            >
              Browse Canva menu templates →
            </a>
          </div>

          <div
            {...getRootProps()}
            className={[
              'border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-colors',
              isDragActive ? 'border-sage bg-sage/10' : 'border-border hover:border-sage/60',
              uploading ? 'opacity-50 pointer-events-none' : '',
            ].join(' ')}
          >
            <input {...getInputProps()} />
            <p className="text-sm font-body">
              {uploading ? 'Uploading...' : 'Drop your menu photo here or tap to browse'}
            </p>
            <p className="text-xs text-muted mt-2">JPG, PNG, or WebP · max 5 MB</p>
          </div>

          {event.menuImageUrl && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted uppercase tracking-wide">Current menu</p>
                <Button variant="ghost" size="sm" onClick={() => void removeMenuImage()}>
                  Remove
                </Button>
              </div>
              <MediaImage
                src={event.menuImageUrl}
                alt={`Menu for ${event.name}`}
                className="w-full rounded-sm border border-border object-contain max-h-96"
                unavailableMessage="Menu image could not be loaded. Re-upload the file — on Render free hosting, files can be lost after a server restart."
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
