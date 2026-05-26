import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Papa from 'papaparse'
import type { CreateGuestInput } from '@/types/guest'
import { Button } from '@/components/ui/Button'

interface GuestUploadProps {
  onUpload: (guests: CreateGuestInput[]) => Promise<void>
}

function parseRow(row: Record<string, string>): CreateGuestInput | null {
  const fullName =
    row.fullName ?? row.fullname ?? row.name ?? row['Full Name'] ?? row['full name']
  const tableNumber =
    row.tableNumber ?? row.table ?? row['Table'] ?? row['table number'] ?? row['Table Number']
  if (!fullName?.trim() || !tableNumber?.trim()) return null

  return {
    fullName: fullName.trim(),
    alias: (row.alias ?? row.Alias ?? row.nickname)?.trim() || undefined,
    tableNumber: tableNumber.trim(),
    seatNumber:
      (row.seatNumber ?? row.seat ?? row.Seat ?? row['Seat Number'])?.trim() || undefined,
  }
}

export function GuestUpload({ onUpload }: GuestUploadProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0]
      if (!file) return
      setError(null)
      setLoading(true)

      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const guests = results.data
            .map(parseRow)
            .filter((g): g is CreateGuestInput => g !== null)

          if (guests.length === 0) {
            setError('No valid rows found. CSV needs fullName and tableNumber columns.')
            setLoading(false)
            return
          }

          try {
            await onUpload(guests)
          } catch {
            setError('Upload failed.')
          } finally {
            setLoading(false)
          }
        },
        error: () => {
          setError('Could not parse CSV file.')
          setLoading(false)
        },
      })
    },
    [onUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
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
          Columns: fullName, tableNumber, alias (optional), seatNumber (optional)
        </p>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          const sample =
            'fullName,alias,tableNumber,seatNumber\nJuan Dela Cruz,Johnny,12,3\nMaria Santos,Claire,5,1'
          const blob = new Blob([sample], { type: 'text/csv' })
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
