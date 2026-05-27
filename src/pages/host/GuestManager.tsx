import { useEffect, useMemo, useState } from 'react'
import { useGuests } from '@/hooks/useGuests'
import { GuestArrivalSummary } from '@/components/host/GuestArrivalSummary'
import { GuestSeatDuplicateAlert } from '@/components/host/GuestSeatDuplicateAlert'
import { addGuest, uploadGuestsCsv, deleteGuest } from '@/lib/api'
import { getApiErrorMessage } from '@/lib/api/errors'
import type { CreateGuestInput } from '@/types/guest'
import type { GuestLookupMode } from '@/types/event'
import {
  duplicateSeatGuestIds,
  findDuplicateSeatAssignments,
  findDuplicateSeatForAssignment,
  formatDuplicateSeatMessage,
} from '@/lib/guestSeatDuplicates'
import { GuestTable } from '@/components/host/GuestTable'
import { GuestUpload } from '@/components/host/GuestUpload'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

interface GuestManagerProps {
  eventId: string
  guestLookupMode?: GuestLookupMode
}

const ARRIVAL_REFRESH_MS = 30_000

export function GuestManager({ eventId, guestLookupMode = 'name_only' }: GuestManagerProps) {
  const { guests, loading, refresh } = useGuests(eventId)
  const [modalOpen, setModalOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [csvError, setCsvError] = useState<string | null>(null)
  const [form, setForm] = useState<CreateGuestInput & { inviteCode?: string }>({
    fullName: '',
    alias: '',
    tableNumber: '',
    seatNumber: '',
    inviteCode: '',
  })

  const duplicateSeats = useMemo(() => findDuplicateSeatAssignments(guests), [guests])
  const conflictingGuestIds = useMemo(() => duplicateSeatGuestIds(guests), [guests])

  const handleAdd = async () => {
    setAddError(null)

    const seatConflict = findDuplicateSeatForAssignment(
      guests,
      form.tableNumber,
      form.seatNumber || undefined
    )
    if (seatConflict) {
      setAddError(formatDuplicateSeatMessage(seatConflict))
      return
    }

    try {
      await addGuest(eventId, {
        fullName: form.fullName,
        alias: form.alias || undefined,
        tableNumber: form.tableNumber,
        seatNumber: form.seatNumber || undefined,
        inviteCode:
          guestLookupMode === 'invite_code' ? form.inviteCode?.trim() || undefined : undefined,
      })
      setModalOpen(false)
      setForm({ fullName: '', alias: '', tableNumber: '', seatNumber: '', inviteCode: '' })
      await refresh()
    } catch (err) {
      setAddError(getApiErrorMessage(err, 'Could not add this guest. Try again.'))
    }
  }

  const handleCsv = async (file: File) => {
    setCsvError(null)
    try {
      await uploadGuestsCsv(eventId, file)
      await refresh()
    } catch (err) {
      setCsvError(getApiErrorMessage(err, 'CSV import failed. Check the file and try again.'))
    }
  }

  const handleDelete = async (guestId: string) => {
    await deleteGuest(eventId, guestId)
    refresh()
  }

  const handleRefreshArrivals = async () => {
    setRefreshing(true)
    try {
      await refresh()
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const id = window.setInterval(() => {
      void refresh()
    }, ARRIVAL_REFRESH_MS)
    return () => window.clearInterval(id)
  }, [refresh])

  return (
    <div className="space-y-6">
      <GuestArrivalSummary
        guests={guests}
        onRefresh={() => void handleRefreshArrivals()}
        refreshing={refreshing || loading}
      />

      <GuestSeatDuplicateAlert duplicates={duplicateSeats} />

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => {
            setAddError(null)
            setModalOpen(true)
          }}
        >
          Add guest
        </Button>
      </div>

      <GuestTable
        guests={guests}
        duplicateSeatGuestIds={conflictingGuestIds}
        onDelete={handleDelete}
      />

      <div>
        <h3 className="font-heading text-lg mb-3">Import from CSV</h3>
        <GuestUpload onUploadCsv={handleCsv} />
        {csvError && <p className="text-xs text-red-600 mt-2">{csvError}</p>}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setAddError(null)
        }}
        title="Add guest"
        footer={
          <div className="flex gap-2 justify-end p-4 border-t border-border">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Add</Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Input
            label="Full name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />
          <Input
            label="Alias (optional)"
            value={form.alias}
            onChange={(e) => setForm({ ...form, alias: e.target.value })}
          />
          <Input
            label="Table number"
            value={form.tableNumber}
            onChange={(e) => {
              setForm({ ...form, tableNumber: e.target.value })
              setAddError(null)
            }}
            required
          />
          <Input
            label="Seat number (optional)"
            value={form.seatNumber}
            onChange={(e) => {
              setForm({ ...form, seatNumber: e.target.value })
              setAddError(null)
            }}
            hint="Each table + seat pair should be unique when a seat number is set."
          />
          {addError && <p className="text-xs text-red-600">{addError}</p>}
          {guestLookupMode === 'invite_code' && (
            <Input
              label="Invite code"
              value={form.inviteCode ?? ''}
              onChange={(e) =>
                setForm({ ...form, inviteCode: e.target.value.toUpperCase() })
              }
              required
            />
          )}
        </div>
      </Modal>
    </div>
  )
}
