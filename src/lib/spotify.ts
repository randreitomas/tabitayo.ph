/** Extract Spotify playlist ID from URL, iframe HTML, or embed link. */
export function parseSpotifyPlaylistId(raw: string): string | null {
  const input = raw.trim()
  if (!input) return null

  const srcMatch = input.match(/src=["']([^"']+)["']/i)
  const candidate = srcMatch?.[1] ?? input

  const match = candidate.match(
    /open\.spotify\.com\/(?:embed\/)?playlist\/([a-zA-Z0-9]+)/
  )
  return match?.[1] ?? null
}

/** URL sent to the API (`spotify_playlist_url`). */
export function toSpotifyPlaylistUrl(raw: string): string | null {
  const id = parseSpotifyPlaylistId(raw)
  if (!id) return null
  return `https://open.spotify.com/playlist/${id}`
}

/** Compact guest embed height (Spotify’s horizontal player bar). */
export const SPOTIFY_EMBED_HEIGHT = 80

/** URL used as iframe `src` on the guest page. */
export function toSpotifyEmbedUrl(raw: string): string | null {
  const id = parseSpotifyPlaylistId(raw)
  if (!id) return null
  return `https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0`
}

export function spotifyInputHint(): string {
  return 'Paste your Spotify playlist link (Share → Copy link). If you only have embed code, paste the whole iframe — we will extract the URL.'
}
