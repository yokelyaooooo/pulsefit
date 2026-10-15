export type MusicSource = "local" | "netease" | "qq" | "apple"

export interface CatalogItem {
  id: string
  source: MusicSource
  nativeId: string
  title: string
  artist: string
  album: string
  artwork: string | null
  durationSec: number
  bpm: number | null
}

export interface PlaylistItem {
  id: string
  source: Exclude<MusicSource, "local">
  nativeId: string
  name: string
  cover: string | null
  trackCount: number | null
  isLiked?: boolean
}

export interface SyncedPlaylist extends PlaylistItem {
  tracks: CatalogItem[]
  syncedAt: number
}

export interface SyncedLibraryState {
  playlists: SyncedPlaylist[]
  updatedAt: number
}

export interface Playable extends CatalogItem {
  audioUrl: string | null
  lyricsText: string
  previewOnly: boolean
  note: string | null
}

export interface MusicSettings {
  neteaseBase: string
  qqBase: string
  appleToken: string
  appleConnected: boolean
  neteaseCookie: string
  neteaseUid: string
  neteaseName: string
  qqCookie: string
  qqUin: string
  qqName: string
}
