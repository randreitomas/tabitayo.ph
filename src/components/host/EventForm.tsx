import { useState, type FormEvent } from 'react'
import type { CreateEventInput, EventTier } from '@/types/event'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { formatTierPrice } from '@/lib/eventApproval'

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await onSubmit({ name, date, venue, tier, photoShareEnabled })
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

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={photoShareEnabled}
          onChange={(e) => setPhotoShareEnabled(e.target.checked)}
          disabled={tier !== 'premium'}
        />
        <span className="text-sm">Enable photo share gallery</span>
      </label>

      <p className="text-xs text-muted leading-relaxed border border-border rounded-sm p-3 bg-border/20">
        After you create this event, pay manually via GCash or bank transfer ({formatTierPrice(tier)}).
        Tabitayo will review your payment and approve your event before the guest page goes live.
      </p>

      <Button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create event'}
      </Button>
    </form>
  )
}
