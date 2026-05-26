import type { Event, EventApprovalStatus, EventTier } from '@/types/event'

export const TIER_PRICES: Record<EventTier, number> = {
  free: 0,
  standard: 799,
  premium: 1999,
}

export const MANUAL_PAYMENT = {
  method: 'GCash / bank transfer',
  gcashNumber: '09XX XXX XXXX',
  accountName: 'Tabitayo',
  note: 'Send payment screenshot to hello@tabitayo.ph with your event name.',
}

export const APPROVAL_LABELS: Record<EventApprovalStatus, string> = {
  pending_payment: 'Awaiting payment',
  payment_submitted: 'Payment under review',
  approved: 'Approved',
  rejected: 'Rejected',
}

export function formatTierPrice(tier: EventTier): string {
  const amount = TIER_PRICES[tier]
  return amount === 0 ? 'Free' : `₱${amount.toLocaleString('en-PH')}`
}

export function isEventGuestLive(event: Event): boolean {
  return event.approvalStatus === 'approved' && event.status === 'active'
}

export function canHostPublishQr(event: Event): boolean {
  return event.approvalStatus === 'approved'
}

export function approvalBadgeVariant(
  status: EventApprovalStatus
): 'pending' | 'approved' | 'suspended' | 'default' {
  switch (status) {
    case 'pending_payment':
      return 'pending'
    case 'payment_submitted':
      return 'default'
    case 'approved':
      return 'approved'
    case 'rejected':
      return 'suspended'
  }
}
