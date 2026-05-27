import { useEffect, useState } from 'react'
import { useGuests } from '@/hooks/useGuests'
import { GuestArrivalSummary } from '@/components/host/GuestArrivalSummary'
import { addGuest, uploadGuestsCsv, deleteGuest } from '@/lib/api'
import type { CreateGuestInput } from '@/types/guest'
import type { GuestLookupMode } from '@/types/event'
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
  const [form, setForm] = useState<CreateGuestInput & { inviteCode?: string }>({
    fullName: '',
    alias: '',
    tableNumber: '',
    seatNumber: '',
    inviteCode: '',
  })

  const handleAdd = async () => {
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
    refresh()
  }

  const handleCsv = async (file: File) => {
    await uploadGuestsCsv(eventId, file)
    refresh()
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

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setModalOpen(true)}>Add guest</Button>
      </div>

      <GuestTable guests={guests} onDelete={handleDelete} />

      <div>
        <h3 className="font-heading text-lg mb-3">Import from CSV</h3>
        <GuestUpload onUploadCsv={handleCsv} />
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
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
            onChange={(e) => setForm({ ...form, tableNumber: e.target.value })}
            required
          />
          <Input
            label="Seat number (optional)"
            value={form.seatNumber}
            onChange={(e) => setForm({ ...form, seatNumber: e.target.value })}
          />
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
