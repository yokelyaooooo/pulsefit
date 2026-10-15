import test from "node:test"
import assert from "node:assert/strict"
import { likedPlaylist, markLikedPlaylist, newestTrackArtwork, parseSyncedLibrary, playlistAnchorId, replaceProviderPlaylists } from "./library-data.ts"
import type { CatalogItem, PlaylistItem, SyncedPlaylist } from "./types.ts"

const track = (id: string, artwork: string | null): CatalogItem => ({
  id: `netease:${id}`,
  source: "netease",
  nativeId: id,
  title: id,
  artist: "Artist",
  album: "Album",
  artwork,
  durationSec: 180,
  bpm: null,
})

const playlist = (name: string, id = name): PlaylistItem => ({
  id: `netease:${id}`,
  source: "netease",
  nativeId: id,
  name,
  cover: null,
  trackCount: 1,
})

test("recognizes a provider liked playlist and falls back to the first list", () => {
  assert.equal(markLikedPlaylist([playlist("旅行"), playlist("我喜欢的音乐")])[1]?.isLiked, undefined)
  assert.equal(likedPlaylist([{ ...playlist("我喜欢的音乐"), tracks: [], syncedAt: 1 }])?.name, "我喜欢的音乐")
  assert.equal(markLikedPlaylist([playlist("第一张"), playlist("第二张")])[0]?.isLiked, true)
})

test("uses the newest available track artwork for a synced playlist cover", () => {
  assert.equal(newestTrackArtwork([track("1", null), track("2", "https://img.example/new.jpg")], "https://img.example/old.jpg"), "https://img.example/new.jpg")
})

test("provider refresh replaces only that provider and keeps the liked list first", () => {
  const apple: SyncedPlaylist = { ...playlist("Apple", "apple"), id: "apple:apple", source: "apple", tracks: [], syncedAt: 1 }
  const normal: SyncedPlaylist = { ...playlist("普通"), tracks: [], syncedAt: 2 }
  const liked: SyncedPlaylist = { ...playlist("红心歌曲"), isLiked: true, tracks: [], syncedAt: 2 }
  const merged = replaceProviderPlaylists([apple], "netease", [normal, liked])
  assert.deepEqual(merged.map((item) => item.id), [liked.id, normal.id, apple.id])
})

test("stored library validation drops invalid rows and keeps playable metadata", () => {
  const parsed = parseSyncedLibrary(JSON.stringify({ playlists: [{ ...playlist("我喜欢"), tracks: [track("1", "https://img.example/1.jpg")], syncedAt: 8 }, { nope: true }], updatedAt: 9 }))
  assert.equal(parsed.playlists.length, 1)
  assert.equal(parsed.playlists[0]?.tracks[0]?.title, "1")
  assert.equal(parsed.updatedAt, 9)
  assert.equal(playlistAnchorId("netease:12 / x"), "playlist-netease-12-x")
})
