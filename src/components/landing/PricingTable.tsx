type CellValue = boolean | string

interface PricingRow {
  feature: string
  free: CellValue
  standard: CellValue
  premium: CellValue
}

const ROWS: PricingRow[] = [
  { feature: 'Seat + name search', free: true, standard: true, premium: true },
  { feature: 'Table browse', free: true, standard: true, premium: true },
  { feature: 'Floor plan', free: true, standard: true, premium: true },
  { feature: 'Menu', free: false, standard: true, premium: true },
  { feature: 'Spotify playlist', free: false, standard: true, premium: true },
  { feature: 'Photo share', free: false, standard: false, premium: true },
  { feature: 'Custom branding', free: false, standard: false, premium: true },
  { feature: 'Guest limit', free: '100', standard: '300', premium: 'Unlimited' },
]

function CheckIcon() {
  return (
    <span
      className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-sage/50 text-dark border border-sage/60"
      aria-label="Included"
    >
      <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none" aria-hidden>
        <path
          d="M2 6l3 3 5-5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

function CrossIcon() {
  return (
    <span className="text-muted/60 font-body text-lg leading-none" aria-label="Not included">
      ×
    </span>
  )
}

function Cell({ value }: { value: CellValue }) {
  if (typeof value === 'string') {
    return <span className="font-body text-sm text-dark">{value}</span>
  }
  return value ? <CheckIcon /> : <CrossIcon />
}

export function PricingTable() {
  return (
    <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 rounded-sm border border-border bg-ivory">
      <table className="w-full min-w-[520px] border-collapse font-body text-dark">
        <thead>
          <tr className="border-b border-border bg-[#f3ede6]/50">
            <th className="w-[38%] py-5 pr-4" />
            <th className="py-5 px-3 text-center font-heading font-semibold text-lg md:text-xl text-dark">
              Free
            </th>
            <th className="py-5 px-3 text-center font-heading font-semibold text-lg md:text-xl text-dark bg-dusty-rose/10 border-x border-dusty-rose/20">
              <span className="block">Standard</span>
              <span className="block text-base md:text-lg font-semibold mt-1 text-muted">
                ₱799
              </span>
            </th>
            <th className="py-5 px-3 text-center font-heading font-semibold text-lg md:text-xl text-dark">
              <span className="block">Premium</span>
              <span className="block text-base md:text-lg font-semibold mt-1 text-muted">
                ₱1,999
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.feature} className="border-b border-border/80 last:border-b-0">
              <td className="py-4 pr-4 pl-4 md:pl-5 text-left text-sm md:text-base text-dark">
                {row.feature}
              </td>
              <td className="py-4 px-3 text-center">
                <Cell value={row.free} />
              </td>
              <td className="py-4 px-3 text-center bg-dusty-rose/5 border-x border-dusty-rose/15">
                <Cell value={row.standard} />
              </td>
              <td className="py-4 px-3 text-center">
                <Cell value={row.premium} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
