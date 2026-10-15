import type { CatalogItem, MusicSource, PlaylistItem, SyncedLibraryState, SyncedPlaylist } from "@/lib/music/types"

export const emptySyncedLibrary: SyncedLibraryState = { playlists: [], updatedAt: 0 }

const likedNames = /^(我喜欢|我喜爱的|喜欢的音乐|红心|收藏|favorite(?:d)? songs?|liked songs?|my favorites?|love songs?|最爱)/i

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null
}

function source(value: unknown): MusicSource | null {
  return value === "netease" || value === "qq" || value === "apple" || value === "local" ? value : null
}

function text(value: unknown) {
  return typeof value === "string" ? value : ""
}

function number(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0
}

function parseTrack(value: unknown): CatalogItem | null {
  const row = record(value)
  const trackSource = source(row?.source)
  const id = text(row?.id)
  const nativeId = text(row?.nativeId)
  if (!row || !trackSource || !id || !nativeId) return null
  return {
    id,
    source: trackSource,
    nativeId,
    title: text(row.title) || "未命名",
    artist: text(row.artist),
    album: text(row.album),
    artwork: text(row.artwork) || null,
    durationSec: Math.max(0, number(row.durationSec)),
    bpm: typeof row.bpm === "number" && Number.isFinite(row.bpm) ? row.bpm : null,
  }
}

function parsePlaylist(value: unknown): SyncedPlaylist | null {
  const row = record(value)
  const playlistSource = source(row?.source)
  const id = text(row?.id)
  const nativeId = text(row?.nativeId)
  if (!row || !playlistSource || playlistSource === "local" || !id || !nativeId) return null
  const tracks = Array.isArray(row.tracks) ? row.tracks.flatMap((track) => parseTrack(track) ?? []) : []
  return {
    id,
    source: playlistSource,
    nativeId,
    name: text(row.name) || "歌单",
    cover: text(row.cover) || tracks.find((track) => track.artwork)?.artwork || null,
    trackCount: typeof row.trackCount === "number" && Number.isFinite(row.trackCount) ? row.trackCount : tracks.length,
    isLiked: row.isLiked === true,
    tracks: tracks.slice(0, 100),
    syncedAt: number(row.syncedAt),
  }
}

export function parseSyncedLibrary(raw: string | null): SyncedLibraryState {
  if (!raw) return emptySyncedLibrary
  try {
    const row = record(JSON.parse(raw))
    const playlists = Array.isArray(row?.playlists) ? row.playlists.flatMap((item) => parsePlaylist(item) ?? []).slice(0, 60) : []
    return { playlists, updatedAt: number(row?.updatedAt) }
  } catch {
    return emptySyncedLibrary
  }
}

export function looksLikeLikedPlaylist(playlist: Pick<PlaylistItem, "name" | "isLiked">) {
  return playlist.isLiked === true || likedNames.test(playlist.name.trim())
}

export function markLikedPlaylist(playlists: PlaylistItem[]) {
  if (!playlists.length || playlists.some(looksLikeLikedPlaylist)) return playlists
  return playlists.map((playlist, index) => index === 0 ? { ...playlist, isLiked: true } : playlist)
}

export function newestTrackArtwork(tracks: CatalogItem[], fallback: string | null) {
  return tracks.find((track) => track.artwork?.startsWith("https://"))?.artwork ?? fallback
}

export function replaceProviderPlaylists(current: SyncedPlaylist[], source: Exclude<MusicSource, "local">, incoming: SyncedPlaylist[]) {
  return [...current.filter((playlist) => playlist.source !== source), ...incoming]
    .sort((left, right) => Number(Boolean(right.isLiked)) - Number(Boolean(left.isLiked)) || right.syncedAt - left.syncedAt)
    .slice(0, 60)
}

export function likedPlaylist(playlists: SyncedPlaylist[]) {
  return playlists.find(looksLikeLikedPlaylist) ?? null
}

export function playlistAnchorId(id: string) {
  return `playlist-${id.replace(/[^a-zA-Z0-9_-]+/g, "-")}`
}

export function musicSourceName(source: MusicSource) {
  if (source === "netease") return "网易云音乐"
  if (source === "qq") return "QQ 音乐"
  if (source === "apple") return "Apple Music"
  return "PulseFit"
}
