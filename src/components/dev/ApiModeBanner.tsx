import { getApiModeLabel, USE_MOCK } from '@/lib/api/config'

/** Dev-only indicator: confirms mock vs live backend (hidden in production builds). */
export function ApiModeBanner() {
  if (!import.meta.env.DEV) return null

  return (
    <div
      className={[
        'fixed bottom-0 inset-x-0 z-50 px-3 py-1.5 text-center text-[11px] font-mono border-t',
        USE_MOCK
          ? 'bg-gold/30 border-gold/50 text-dark'
          : 'bg-sage/25 border-sage/50 text-dark',
      ].join(' ')}
      role="status"
    >
      {getApiModeLabel()}
    </div>
  )
}
