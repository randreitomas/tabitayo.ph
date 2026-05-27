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

export interface ApiEventSetup {
  has_menu: boolean
  has_floor_plan: boolean
  has_spotify_playlist: boolean
  has_qr_code: boolean
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
  guest_lookup_mode?: string
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
  setup?: ApiEventSetup
  created_at?: string
  updated_at?: string
}

export interface ApiQrCode {
  event_id: string
  qr_code_token: string
  qr_code_payload: string
  public_guest_page_path: string
  public_lookup_path?: string
  public_guest_search_path?: string
  created_at?: string
}

export interface ApiGuest {
  id: string
  event_id: string
  full_name: string
  alias?: string | null
  lookup_token?: string | null
  invite_code?: string | null
  table_number: string
  seat_number?: string | null
  seat_confirmation_status?: string | null
  seat_confirmed_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface ApiPublicEvent {
  event_name: string
  event_date: string
  venue: string
  guest_lookup_mode?: string
  tier?: string
  status?: string
  approval_status?: string
  floor_plan_url?: string | null
  menu?: ApiMenuJson | null
  menu_json?: ApiMenuJson | null
  spotify_url?: string | null
  photo_share_enabled?: boolean
}

export interface ApiGuestLookupResponse {
  guest_id: string
  event_name: string
  guest_name: string
  table_number: string
  seat_number?: string | null
  seat_confirmation_status?: string | null
}

export interface ApiSeatConfirmResponse extends ApiGuestLookupResponse {
  seat_confirmed_at?: string | null
}

/** GET /public/events/{token}/guests/search — same shape as guest lookup */
export type ApiGuestSearchResult = ApiGuestLookupResponse

export interface ApiPublicGuestSuggestion {
  display_name: string
}

export interface ApiPublicGuestSuggestionResponse {
  items: ApiPublicGuestSuggestion[]
  limit: number
}

export interface ApiFloorPlanAssetRead {
  floor_plan_url: string
}

export interface ApiMenuAssetRead {
  menu: ApiMenuJson
}

export interface ApiSpotifyPlaylistRead {
  spotify_playlist_url: string
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
