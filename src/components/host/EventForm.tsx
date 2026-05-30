import { useState, type FormEvent } from 'react'
import type { CreateEventInput, EventTier, GuestLookupMode } from '@/types/event'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { formatTierPrice } from '@/lib/eventApproval'
import { HOST_PHOTO_GALLERY_ACK_TEXT } from '@/lib/photoShare'

interface EventFormProps {
  onSubmit: (data: CreateEventInput) => Promise<void>
  loading?: boolean
}

const TIERS: { value: EventTier; label: string; desc: string }[] = [
  { value: 'free', label: 'Free', desc: 'Name search & table browse · ₱0' },
  { value: 'standard', label: 'Standard', desc: 'Floor plan, menu, playlist · ₱799' },
  { value: 'premium', label: 'Premium', desc: 'Photo share gallery + all features · ₱1,999' },
]

export function EventForm({ onSubmit, loading }: EventFormProps) {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [venue, setVenue] = useState('')
  const [tier, setTier] = useState<EventTier>('standard')
  const [photoShareEnabled, setPhotoShareEnabled] = useState(false)
  const [photoShareGalleryAck, setPhotoShareGalleryAck] = useState(false)
  const [guestLookupMode, setGuestLookupMode] = useState<GuestLookupMode>('name_only')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await onSubmit({
      name,
      date,
      venue,
      tier,
      photoShareEnabled,
      photoSharePublicGalleryAcknowledged: photoShareEnabled ? photoShareGalleryAck : false,
      guestLookupMode,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
      <Input label="Event name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      <Input label="Venue" value={venue} onChange={(e) => setVenue(e.target.value)} required />

      <fieldset>
        <legend className="text-xs text-muted mb-2 block">Tier</legend>
        <div className="space-y-2">
          {TIERS.map((t) => (
            <label
              key={t.value}
              className={[
                'flex items-start gap-3 p-3 border rounded-sm cursor-pointer transition-colors',
                tier === t.value ? 'border-dark bg-border/30' : 'border-border hover:bg-border/20',
              ].join(' ')}
            >
              <input
                type="radio"
                name="tier"
                value={t.value}
                checked={tier === t.value}
                onChange={() => {
                  setTier(t.value)
                  if (t.value === 'premium') setPhotoShareEnabled(true)
                }}
                className="mt-1"
              />
              <div>
                <span className="font-heading text-lg">{t.label}</span>
                <p className="text-xs text-muted">{t.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs text-muted mb-2 block">How guests find their seat</legend>
        <div className="space-y-2">
          {(
            [
              { value: 'name_only' as const, label: 'Name only', desc: 'Guests search by full name' },
              {
                value: 'invite_code' as const,
                label: 'Name + invite code',
                desc: 'Guests enter name and a code from their invitation',
              },
              {
                value: 'personal_token' as const,
                label: 'Personal code',
                desc: 'Each guest uses a unique code (from CSV import)',
              },
            ] as const
          ).map((m) => (
            <label
              key={m.value}
              className={[
                'flex items-start gap-3 p-3 border rounded-sm cursor-pointer transition-colors',
                guestLookupMode === m.value
                  ? 'border-dark bg-border/30'
                  : 'border-border hover:bg-border/20',
              ].join(' ')}
            >
              <input
                type="radio"
                name="guestLookupMode"
                value={m.value}
                checked={guestLookupMode === m.value}
                onChange={() => setGuestLookupMode(m.value)}
                className="mt-1"
              />
              <div>
                <span className="font-heading text-base">{m.label}</span>
                <p className="text-xs text-muted">{m.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={photoShareEnabled}
          onChange={(e) => {
            const enabled = e.target.checked
            setPhotoShareEnabled(enabled)
            if (!enabled) setPhotoShareGalleryAck(false)
          }}
          disabled={tier !== 'premium'}
        />
        <span className="text-sm">Enable photo share gallery</span>
      </label>

      {photoShareEnabled && tier === 'premium' && (
        <label className="flex items-start gap-2 cursor-pointer border border-border rounded-sm p-3 bg-border/10">
          <input
            type="checkbox"
            checked={photoShareGalleryAck}
            onChange={(e) => setPhotoShareGalleryAck(e.target.checked)}
            className="mt-0.5"
            required
          />
          <span className="text-xs text-muted leading-relaxed">{HOST_PHOTO_GALLERY_ACK_TEXT}</span>
        </label>
      )}

      <p className="text-xs text-muted leading-relaxed border border-border rounded-sm p-3 bg-border/20">
        After you create this event, pay manually via GCash or bank transfer ({formatTierPrice(tier)}).
        Tabitayo will review your payment and approve your event before the guest page goes live.
      </p>

      <Button
        type="submit"
        disabled={loading || (photoShareEnabled && !photoShareGalleryAck)}
      >
        {loading ? 'Creating...' : 'Create event'}
      </Button>
    </form>
  )
}
