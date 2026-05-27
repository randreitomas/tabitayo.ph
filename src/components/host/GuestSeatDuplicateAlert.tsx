import type { DuplicateSeatAssignment } from '@/lib/guestSeatDuplicates'
import { formatDuplicateSeatMessage } from '@/lib/guestSeatDuplicates'

interface GuestSeatDuplicateAlertProps {
  duplicates: DuplicateSeatAssignment[]
}

export function GuestSeatDuplicateAlert({ duplicates }: GuestSeatDuplicateAlertProps) {
  if (duplicates.length === 0) return null

  return (
    <div
      className="rounded-sm border border-red-300 bg-red-50 px-4 py-3 space-y-2"
      role="alert"
    >
      <p className="text-sm font-medium text-red-900">
        Duplicate seat assignments
      </p>
      <p className="text-xs text-red-800/90 leading-relaxed">
        Two or more guests share the same table and seat number. Each seat should only have one
        guest, or guests may get the wrong assignment when they look up their seat.
      </p>
      <ul className="text-xs text-red-800 space-y-1 list-disc list-inside">
        {duplicates.map((group) => (
          <li key={`${group.tableNumber}-${group.seatNumber}`}>
            {formatDuplicateSeatMessage(group)}
          </li>
        ))}
      </ul>
    </div>
  )
}
