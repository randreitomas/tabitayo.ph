import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { GUEST_CSV_TEMPLATE_SAMPLE } from '@/lib/guestCsv'
import { Button } from '@/components/ui/Button'

interface GuestUploadProps {
  onUploadCsv: (file: File) => Promise<void>
}

export function GuestUpload({ onUploadCsv }: GuestUploadProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0]
      if (!file) return
      setError(null)
      setLoading(true)
      try {
        await onUploadCsv(file)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed.')
      } finally {
        setLoading(false)
      }
    },
    [onUploadCsv]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
    maxSize: 1024 * 1024,
    disabled: loading,
  })

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={[
          'border-2 border-dashed rounded-sm p-8 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-sage bg-sage/10' : 'border-border hover:border-sage/60',
          loading ? 'opacity-50 pointer-events-none' : '',
        ].join(' ')}
      >
        <input {...getInputProps()} />
        <p className="text-sm">
          {loading ? 'Importing...' : 'Drop CSV here or click to browse'}
        </p>
        <p className="text-xs text-muted mt-2">
          Required columns: <span className="font-mono">fullName</span>,{' '}
          <span className="font-mono">tableNumber</span> · optional: alias, seatNumber · max 1 MB
        </p>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const blob = new Blob([GUEST_CSV_TEMPLATE_SAMPLE], { type: 'text/csv' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'guest-list-template.csv'
          a.click()
          URL.revokeObjectURL(url)
        }}
      >
        Download template
      </Button>
    </div>
  )
}
