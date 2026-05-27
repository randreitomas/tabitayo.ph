import type { EventSetup } from '@/types/event'

interface EventSetupChecklistProps {
  setup?: EventSetup
}

const ITEMS: { key: keyof EventSetup; label: string }[] = [
  { key: 'hasFloorPlan', label: 'Floor plan' },
  { key: 'hasMenu', label: 'Menu' },
  { key: 'hasSpotifyPlaylist', label: 'Playlist' },
  { key: 'hasQrCode', label: 'QR code' },
]

export function EventSetupChecklist({ setup }: EventSetupChecklistProps) {
  if (!setup) return null

  return (
    <ul className="flex flex-wrap gap-2 text-xs">
      {ITEMS.map(({ key, label }) => (
        <li
          key={key}
          className={[
            'px-2 py-1 rounded-sm border',
            setup[key]
              ? 'border-sage/60 bg-sage/15 text-dark'
              : 'border-border text-muted',
          ].join(' ')}
        >
          {setup[key] ? '✓' : '○'} {label}
        </li>
      ))}
    </ul>
  )
}
