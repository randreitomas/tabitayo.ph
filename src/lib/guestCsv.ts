import Papa from 'papaparse'
import type { CreateGuestInput } from '@/types/guest'

/** Column names shown in the downloadable template (camelCase). */
export const GUEST_CSV_TEMPLATE_HEADER = 'fullName,alias,tableNumber,seatNumber'

export const GUEST_CSV_TEMPLATE_SAMPLE = `${GUEST_CSV_TEMPLATE_HEADER}
Juan Dela Cruz,Johnny,Table 1,4
Maria Santos,,Table 2,`

const REQUIRED_COLUMN_HINT =
  'Required columns: fullName and tableNumber (also accepted: full_name, table_number).'

function normalizeHeaderKey(header: string): string {
  return header.trim().toLowerCase().replace(/[\s_-]+/g, '')
}

const HEADER_ALIASES: Record<string, keyof CreateGuestInput> = {
  fullname: 'fullName',
  name: 'fullName',
  guestname: 'fullName',
  alias: 'alias',
  tablenumber: 'tableNumber',
  table: 'tableNumber',
  seatnumber: 'seatNumber',
  seat: 'seatNumber',
  invitecode: 'inviteCode',
}

function mapRow(row: Record<string, string>): CreateGuestInput | null {
  const mapped: Partial<CreateGuestInput> = {}

  for (const [header, value] of Object.entries(row)) {
    const field = HEADER_ALIASES[normalizeHeaderKey(header)]
    if (!field) continue
    const trimmed = value?.trim()
    if (!trimmed) continue
    mapped[field] = trimmed
  }

  if (!mapped.fullName?.trim() || !mapped.tableNumber?.trim()) return null

  return {
    fullName: mapped.fullName.trim(),
    tableNumber: mapped.tableNumber.trim(),
    alias: mapped.alias?.trim() || undefined,
    seatNumber: mapped.seatNumber?.trim() || undefined,
    inviteCode: mapped.inviteCode?.trim() || undefined,
  }
}

export function parseGuestCsvText(text: string): CreateGuestInput[] {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  })

  if (parsed.errors.length > 0) {
    throw new Error('Could not parse CSV file.')
  }

  const inputs = parsed.data
    .map(mapRow)
    .filter((row): row is CreateGuestInput => row !== null)

  if (inputs.length === 0) {
    throw new Error(`No valid guest rows found. ${REQUIRED_COLUMN_HINT}`)
  }

  return inputs
}

export function parseGuestCsvFile(file: File): Promise<CreateGuestInput[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error('Could not parse CSV file.'))
          return
        }

        const inputs = results.data
          .map(mapRow)
          .filter((row): row is CreateGuestInput => row !== null)

        if (inputs.length === 0) {
          reject(new Error(`No valid guest rows found. ${REQUIRED_COLUMN_HINT}`))
          return
        }

        resolve(inputs)
      },
      error: () => reject(new Error('Could not parse CSV file.')),
    })
  })
}

/** Rewrite guest CSV with snake_case headers for the backend upload endpoint. */
export function guestInputsToBackendCsvFile(
  inputs: CreateGuestInput[],
  originalName: string
): File {
  const csv = Papa.unparse(
    inputs.map((row) => ({
      full_name: row.fullName,
      alias: row.alias ?? '',
      table_number: row.tableNumber,
      seat_number: row.seatNumber ?? '',
      ...(row.inviteCode ? { invite_code: row.inviteCode } : {}),
    }))
  )

  return new File([csv], originalName.replace(/\.csv$/i, '') + '-import.csv', {
    type: 'text/csv',
  })
}

export async function normalizeGuestCsvForUpload(file: File): Promise<File> {
  const inputs = await parseGuestCsvFile(file)
  return guestInputsToBackendCsvFile(inputs, file.name)
}
