import { applePlaylistTracks, appleSearch } from "@/lib/music/apple"
import { localPlayable } from "@/lib/music/local"
import { neteasePlaylistTracks, neteaseSearch, neteaseSong } from "@/lib/music/netease"
import { parseLrc } from "@/lib/music/lrc"
import { qqPlaylistTracks, qqSearch, qqSong } from "@/lib/music/qq"
import type { CatalogItem, MusicSettings, Playable } from "@/lib/music/types"

export async function searchSource(source: CatalogItem["source"], term: string, settings: MusicSettings) {
  if (source === "netease") return neteaseSearch(settings, term)
  if (source === "qq") return qqSearch(settings, term)
  if (source === "apple") return appleSearch(settings.appleToken, term)
  return []
}

export async function tracksForPlaylist(
  source: CatalogItem["source"],
  nativeId: string,
  settings: MusicSettings
) {
  if (source === "netease") return neteasePlaylistTracks(settings, nativeId)
  if (source === "qq") return qqPlaylistTracks(settings, nativeId)
  if (source === "apple") return applePlaylistTracks(settings.appleToken, nativeId)
  return []
}

export async function resolvePlayback(item: CatalogItem, settings: MusicSettings): Promise<Playable> {
  if (item.source === "local") {
    const local = localPlayable(item.nativeId)
    if (!local) throw new Error("本地曲目不存在。")
    return local
  }
  if (item.source === "apple") {
    return {
      ...item,
      audioUrl: null,
      lyricsText: "",
      previewOnly: false,
      note: "由 Apple Music 播放。没有订阅时通常只有试听，歌词跟随 MusicKit，不保证逐行同步。",
    }
  }
  const media =
    item.source === "netease" ? await neteaseSong(settings, item.nativeId) : await qqSong(settings, item.nativeId)
  return {
    ...item,
    audioUrl: media.url,
    lyricsText: media.lyric,
    previewOnly: media.previewOnly,
    note: media.note,
  }
}

export function playableLyrics(item: Playable) {
  return parseLrc(item.lyricsText)
}
