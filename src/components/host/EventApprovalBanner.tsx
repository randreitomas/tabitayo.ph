import { useState } from 'react'
import type { Event } from '@/types/event'
import { submitEventPayment } from '@/lib/api'
import {
  APPROVAL_LABELS,
  MANUAL_PAYMENT,
  approvalBadgeVariant,
  formatTierPrice,
  canHostPublishQr,
} from '@/lib/eventApproval'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface EventApprovalBannerProps {
  event: Event
  onUpdated: (event: Event) => void
}

export function EventApprovalBanner({ event, onUpdated }: EventApprovalBannerProps) {
  const [submitting, setSubmitting] = useState(false)

  if (event.approvalStatus === 'approved') {
    return (
      <Card padding="md" className="border-sage/50 bg-sage/10">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="approved">{APPROVAL_LABELS.approved}</Badge>
          <p className="text-sm text-dark">
            Your event is live. Guests can use your QR code to find their seats.
          </p>
        </div>
      </Card>
    )
  }

  if (event.approvalStatus === 'rejected') {
    return (
      <Card padding="md" className="border-red-200 bg-red-50">
        <Badge variant="suspended">{APPROVAL_LABELS.rejected}</Badge>
        <p className="text-sm mt-3 text-dark">
          This event was not approved.
          {event.rejectionReason && (
            <span className="block mt-1 text-muted">Reason: {event.rejectionReason}</span>
          )}
        </p>
        <p className="text-xs text-muted mt-2">
          Contact hello@tabitayo.ph if you have questions.
        </p>
      </Card>
    )
  }

  const price = formatTierPrice(event.tier)
  const showSubmit = event.approvalStatus === 'pending_payment'

  return (
    <Card padding="md" className="border-gold/50 bg-gold/10 space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={approvalBadgeVariant(event.approvalStatus)}>
          {APPROVAL_LABELS[event.approvalStatus]}
        </Badge>
        <span className="text-sm font-body">
          Tier: <strong className="font-heading">{price}</strong>
        </span>
      </div>

      {event.approvalStatus === 'payment_submitted' ? (
        <p className="text-sm text-dark/90 leading-relaxed">
          We received your payment notice. Tabitayo will review and approve your event
          shortly. Your guest page and QR code will work once approved.
        </p>
      ) : (
        <>
          <p className="text-sm text-dark/90 leading-relaxed">
            New events require manual payment and admin approval before going live. Complete
            payment below, then we will activate your event.
          </p>
          <div className="text-sm space-y-2 border border-border rounded-sm p-4 bg-ivory">
            <p className="font-heading text-base">Manual payment instructions</p>
            <p>
              <span className="text-muted">Amount due:</span> {price}
            </p>
            <p>
              <span className="text-muted">Method:</span> {MANUAL_PAYMENT.method}
            </p>
            <p>
              <span className="text-muted">GCash:</span> {MANUAL_PAYMENT.gcashNumber}
            </p>
            <p>
              <span className="text-muted">Account name:</span> {MANUAL_PAYMENT.accountName}
            </p>
            <p className="text-xs text-muted">{MANUAL_PAYMENT.note}</p>
          </div>
        </>
      )}

      {showSubmit && (
        <Button
          disabled={submitting}
          onClick={async () => {
            setSubmitting(true)
            try {
              const updated = await submitEventPayment(event.id)
              onUpdated(updated)
            } finally {
              setSubmitting(false)
            }
          }}
        >
          {submitting ? 'Submitting...' : "I've submitted payment"}
        </Button>
      )}

      {!canHostPublishQr(event) && (
        <p className="text-xs text-muted">
          Guest page and QR code are disabled until your event is approved.
        </p>
      )}
    </Card>
  )
}
