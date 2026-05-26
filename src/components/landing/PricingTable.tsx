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
      className="inline-flex items-center justify-center w-5 h-5 rounded-sm bg-[#3d8b5f] text-white"
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
    <span className="text-[#c45c5c] font-body text-lg leading-none" aria-label="Not included">
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
    <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
      <table className="w-full min-w-[520px] border-collapse bg-ivory font-body text-dark">
        <thead>
          <tr className="border-b border-border">
            <th className="w-[38%] py-4 pr-4" />
            <th className="py-4 px-3 text-center font-heading font-semibold text-lg md:text-xl">
              Free
            </th>
            <th className="py-4 px-3 text-center font-heading font-semibold text-lg md:text-xl">
              <span className="block">Standard</span>
              <span className="block text-base md:text-lg font-semibold mt-0.5">₱799</span>
            </th>
            <th className="py-4 px-3 text-center font-heading font-semibold text-lg md:text-xl">
              <span className="block">Premium</span>
              <span className="block text-base md:text-lg font-semibold mt-0.5">₱1,999</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.feature} className="border-b border-border last:border-b">
              <td className="py-4 pr-4 text-left text-sm md:text-base font-body text-dark">
                {row.feature}
              </td>
              <td className="py-4 px-3 text-center">
                <Cell value={row.free} />
              </td>
              <td className="py-4 px-3 text-center">
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
