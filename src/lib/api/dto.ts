/** Snake_case shapes returned by the TabiTayo backend API */

export interface ApiUser {
  id: string
  email: string
  display_name: string
  role: 'host' | 'admin'
  host_status?: string | null
  created_at: string
  updated_at: string
}

export interface ApiAuthResponse {
  access_token: string
  token_type: string
  user: ApiUser
}

export interface ApiMenuJson {
  display_mode?: 'text' | 'image'
  appetizer?: string | null
  main?: string | null
  dessert?: string | null
  image_url?: string | null
}

export interface ApiEvent {
  id: string
  public_slug: string
  host_id: string
  name: string
  date: string
  venue: string
  tier: string
  status: string
  approval_status: string
  floor_plan_url?: string | null
  menu_json?: ApiMenuJson | null
  spotify_url?: string | null
  photo_share_enabled: boolean
  custom_branding_json?: { primary_color?: string; logo_url?: string } | null
  payment_submitted_at?: string | null
  approved_at?: string | null
  rejected_at?: string | null
  rejection_reason?: string | null
  created_at?: string
  updated_at?: string
}

export interface ApiGuest {
  id: string
  event_id: string
  full_name: string
  alias?: string | null
  table_number: string
  seat_number?: string | null
  created_at?: string
  updated_at?: string
}

export interface ApiGuestList {
  items?: ApiGuest[]
  guests?: ApiGuest[]
  total?: number
}

export interface ApiCsvUploadResult {
  created_count: number
  skipped_count: number
  errors: string[]
  guests: ApiGuest[]
}

export interface ApiPublicEvent {
  event_name: string
  event_date: string
  venue: string
  tier?: string
  status?: string
  approval_status?: string
  floor_plan_url?: string | null
  menu?: ApiMenuJson | null
  menu_json?: ApiMenuJson | null
  spotify_url?: string | null
  photo_share_enabled?: boolean
  custom_branding_json?: { primary_color?: string; logo_url?: string } | null
}

export interface ApiGuestSearchResult extends ApiPublicEvent {
  guest_name: string
  table_number: string
  seat_number?: string | null
}

export interface ApiPaymentSubmission {
  id: string
  event_id: string
  status: string
  proof_url?: string | null
  admin_notes?: string | null
  created_at?: string
  updated_at?: string
}

export interface ApiPaymentSubmissionList {
  items?: ApiPaymentSubmission[]
  payment_submissions?: ApiPaymentSubmission[]
}
