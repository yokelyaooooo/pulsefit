import { createJsonStore } from "@/lib/json-store"
import { appleLibrary } from "@/lib/music/apple"
import { getMusicSnapshot } from "@/lib/music/config"
import { emptySyncedLibrary, markLikedPlaylist, newestTrackArtwork, parseSyncedLibrary, replaceProviderPlaylists } from "@/lib/music/library-data"
import { rememberCatalog } from "@/lib/music/local"
import { neteasePlaylists } from "@/lib/music/netease"
import { qqPlaylists } from "@/lib/music/qq"
import { tracksForPlaylist } from "@/lib/music/resolve"
import type { MusicSettings, MusicSource, SyncedPlaylist } from "@/lib/music/types"
import { rememberImported } from "@/lib/music/wall"

type Provider = Exclude<MusicSource, "local">

const store = createJsonStore("pulsefit.library.v1", parseSyncedLibrary, emptySyncedLibrary)
const pending = new Map<Provider, Promise<SyncedPlaylist[]>>()

export const subscribeLibrary = store.subscribe
export const getLibrarySnapshot = store.getSnapshot
export const getServerLibrarySnapshot = store.getServerSnapshot

export function hydrateLibrary() {
  store.hydrate()
  rememberCatalog(store.getSnapshot().playlists.flatMap((playlist) => playlist.tracks))
}

export function forgetProviderLibrary(source: Provider) {
  const snapshot = store.getSnapshot()
  store.update({ playlists: snapshot.playlists.filter((playlist) => playlist.source !== source), updatedAt: Date.now() })
}

export function connectedProviders(settings: MusicSettings): Provider[] {
  const providers: Provider[] = []
  if (settings.neteaseUid && settings.neteaseCookie) providers.push("netease")
  if (settings.qqUin && settings.qqCookie) providers.push("qq")
  if (settings.appleToken && settings.appleConnected) providers.push("apple")
  return providers
}

async function loadPlaylistIndex(source: Provider, settings: MusicSettings) {
  if (source === "netease") return neteasePlaylists(settings)
  if (source === "qq") return qqPlaylists(settings)
  return appleLibrary(settings.appleToken)
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, run: (item: T) => Promise<R>) {
  const results = new Array<R>(items.length)
  let next = 0
  async function worker() {
    while (next < items.length) {
      const index = next++
      results[index] = await run(items[index])
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}

export function syncProviderLibrary(source: Provider, settings = getMusicSnapshot()) {
  const existing = pending.get(source)
  if (existing) return existing
  const task = (async () => {
    const indexed = markLikedPlaylist(await loadPlaylistIndex(source, settings))
    const syncedAt = Date.now()
    const synced = await mapWithConcurrency(indexed.slice(0, 24), 3, async (playlist): Promise<SyncedPlaylist> => {
      let tracks = []
      try {
        tracks = await tracksForPlaylist(source, playlist.nativeId, settings)
      } catch {
        const previous = store.getSnapshot().playlists.find((item) => item.id === playlist.id)
        tracks = previous?.tracks ?? []
      }
      rememberCatalog(tracks)
      return {
        ...playlist,
        cover: newestTrackArtwork(tracks, playlist.cover),
        trackCount: playlist.trackCount ?? tracks.length,
        tracks: tracks.slice(0, 100),
        syncedAt,
      }
    })
    const snapshot = store.getSnapshot()
    store.update({ playlists: replaceProviderPlaylists(snapshot.playlists, source, synced), updatedAt: syncedAt })
    rememberImported(synced.flatMap((playlist) => playlist.tracks.slice(0, 10).map((track) => ({
      id: track.id,
      title: track.title,
      artist: track.artist || track.album,
      artwork: track.artwork || "",
      source: track.source,
    }))))
    return synced
  })().finally(() => pending.delete(source))
  pending.set(source, task)
  return task
}
