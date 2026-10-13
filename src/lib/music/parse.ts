import type { CatalogItem, PlaylistItem } from "@/lib/music/types"

function record(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function num(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function names(value: unknown) {
  if (!Array.isArray(value)) return ""
  return value
    .map((item) => text(record(item)?.name))
    .filter(Boolean)
    .join(" / ")
}

export function readNeteaseSongs(payload: unknown): CatalogItem[] {
  const root = record(payload)
  const buckets = [
    root?.songs,
    record(root?.playlist)?.tracks,
    record(root?.result)?.songs,
    record(record(root?.data)?.playlist)?.tracks,
  ]
  const songs = buckets.find(Array.isArray)
  if (!Array.isArray(songs)) return []
  const items: CatalogItem[] = []
  for (const entry of songs) {
    const song = record(entry)
    if (!song) continue
    const nativeId = String(song.id ?? "")
    if (!nativeId || nativeId === "undefined") continue
    const album = record(song.al) ?? record(song.album)
    const durationMs = num(song.dt) ?? num(song.duration) ?? 0
    items.push({
      id: `netease:${nativeId}`,
      source: "netease",
      nativeId,
      title: text(song.name) || "未命名",
      artist: names(song.ar) || names(song.artists) || "网易云音乐",
      album: text(album?.name),
      artwork: text(album?.picUrl) || null,
      durationSec: Math.max(0, Math.round(durationMs / 1000)),
      bpm: null,
    })
  }
  return items
}

export function readNeteasePlaylists(payload: unknown): PlaylistItem[] {
  const list = record(payload)?.playlist
  if (!Array.isArray(list)) return []
  return list.flatMap((entry) => {
    const item = record(entry)
    if (!item || item.id == null) return []
    const nativeId = String(item.id)
    return [
      {
        id: `netease:${nativeId}`,
        source: "netease" as const,
        nativeId,
        name: text(item.name) || "歌单",
        cover: text(item.coverImgUrl) || null,
        trackCount: num(item.trackCount),
      },
    ]
  })
}

export function readNeteaseUrl(payload: unknown, nativeId: string) {
  const rows = record(payload)?.data
  if (!Array.isArray(rows)) return { url: null as string | null, previewOnly: false }
  const row =
    rows.map(record).find((item) => item && String(item.id) === nativeId) ?? record(rows[0])
  const url = text(row?.url) || null
  return { url, previewOnly: Boolean(url && row?.freeTrialInfo) }
}

export function readNeteaseLyric(payload: unknown) {
  return text(record(record(payload)?.lrc)?.lyric)
}

export function readQrKey(payload: unknown) {
  const data = record(record(payload)?.data)
  return text(data?.unikey) || null
}

export function readQrImage(payload: unknown) {
  const data = record(record(payload)?.data) ?? record(payload)
  return {
    image: text(data?.qrimg) || null,
    url: text(data?.qrurl) || null,
  }
}

export function readQrCheck(payload: unknown) {
  const root = record(payload)
  const code = num(root?.code) ?? 0
  return {
    code,
    cookie: text(root?.cookie) || null,
    message: text(root?.message) || qrMessage(code),
  }
}

function qrMessage(code: number) {
  if (code === 803) return "登录成功"
  if (code === 802) return "已扫码，等待确认"
  if (code === 801) return "等待扫码"
  if (code === 800) return "二维码过期"
  return "还没有登录结果"
}

export function readNeteaseAccount(payload: unknown) {
  const root = record(payload)
  const profile = record(root?.profile)
  const account = record(root?.account)
  const uid = profile?.userId ?? account?.id
  return {
    uid: uid == null ? "" : String(uid),
    name: text(profile?.nickname),
  }
}

function walk(value: unknown, depth: number, visit: (row: Record<string, unknown>) => void) {
  if (depth > 6 || !value) return
  if (Array.isArray(value)) {
    value.forEach((item) => walk(item, depth + 1, visit))
    return
  }
  const row = record(value)
  if (!row) return
  visit(row)
  Object.values(row).forEach((item) => walk(item, depth + 1, visit))
}

export function readQqSongs(payload: unknown): CatalogItem[] {
  const found: CatalogItem[] = []
  const seen = new Set<string>()
  walk(payload, 0, (row) => {
    const nativeId = text(row.songmid) || text(row.mid)
    const title = text(row.songname) || text(row.name) || text(row.title)
    if (!nativeId || !title || seen.has(nativeId)) return
    if (!row.songmid && !row.songname && !row.singer) return
    seen.add(nativeId)
    const album = record(row.album)
    found.push({
      id: `qq:${nativeId}`,
      source: "qq",
      nativeId,
      title,
      artist: names(row.singer) || text(row.singername) || "QQ 音乐",
      album: text(row.albumname) || text(album?.name),
      artwork: qqCover(text(row.albummid) || text(album?.mid)),
      durationSec: Math.max(0, Math.round(num(row.interval) ?? (num(row.duration) ?? 0))),
      bpm: null,
    })
  })
  return found
}

function qqCover(albumMid: string) {
  if (!albumMid) return null
  return `https://y.gtimg.cn/music/photo_new/T002R300x300M000${albumMid}.jpg`
}

export function readQqPlaylists(payload: unknown): PlaylistItem[] {
  const found: PlaylistItem[] = []
  const seen = new Set<string>()
  walk(payload, 0, (row) => {
    const nativeId = text(row.dissid) || text(row.tid) || (row.dirid == null ? "" : String(row.dirid))
    const name = text(row.diss_name) || text(row.dissname) || text(row.title) || text(row.name)
    if (!nativeId || !name || seen.has(nativeId)) return
    if (!row.dissid && !row.diss_name && !row.dissname && !row.tid) return
    seen.add(nativeId)
    found.push({
      id: `qq:${nativeId}`,
      source: "qq",
      nativeId,
      name,
      cover: text(row.diss_cover) || text(row.logo) || null,
      trackCount: num(row.song_cnt) ?? num(row.songnum) ?? num(row.total_song_num),
    })
  })
  return found
}

export function readQqUrls(payload: unknown) {
  const data = record(record(payload)?.data) ?? record(payload)
  const urls: Record<string, string> = {}
  if (!data) return urls
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string" && /^https?:\/\//.test(value)) urls[key] = value
    const row = record(value)
    const url = text(row?.url) || text(row?.purl)
    if (url) urls[key] = url.startsWith("http") ? url : ""
  }
  return urls
}

export function readQqLyric(payload: unknown) {
  const data = record(record(payload)?.data) ?? record(payload)
  const lyric = text(data?.lyric)
  if (lyric.includes("[")) return lyric
  if (!lyric) return ""
  try {
    const decoded = atob(lyric)
    return decoded.includes("[") ? decoded : lyric
  } catch {
    return lyric
  }
}

export function qqUinFromCookie(cookie: string) {
  const match = cookie.match(/(?:^|[;\s])(?:uin|p_uin|wxuin)=o?(\d+)/i)
  return match?.[1] ?? ""
}

export function readAppleSongs(payload: unknown): CatalogItem[] {
  const songs = appleCollection(payload, "songs")
  return songs.map((song) => appleSong(song)).filter((item): item is CatalogItem => Boolean(item))
}

export function readApplePlaylists(payload: unknown): PlaylistItem[] {
  const rows = appleDataArray(payload)
  return rows.flatMap((row) => {
    const item = record(row)
    const attributes = record(item?.attributes)
    const nativeId = text(item?.id)
    if (!nativeId || !attributes) return []
    return [
      {
        id: `apple:${nativeId}`,
        source: "apple" as const,
        nativeId,
        name: text(attributes.name) || "播放列表",
        cover: artworkUrl(record(attributes.artwork), 300),
        trackCount: num(attributes.trackCount),
      },
    ]
  })
}

export function readApplePlaylistTracks(payload: unknown): CatalogItem[] {
  return appleDataArray(payload)
    .map((row) => appleSong(row))
    .filter((item): item is CatalogItem => Boolean(item))
}

function appleCollection(payload: unknown, key: string) {
  const results = record(record(record(payload)?.data)?.results) ?? record(record(payload)?.results)
  const bucket = record(results?.[key])
  return Array.isArray(bucket?.data) ? bucket.data : []
}

function appleDataArray(payload: unknown) {
  const data = record(payload)?.data ?? record(record(payload)?.data)?.data
  return Array.isArray(data) ? data : []
}

function appleSong(value: unknown): CatalogItem | null {
  const song = record(value)
  const attributes = record(song?.attributes)
  const nativeId = text(song?.id)
  if (!song || !attributes || !nativeId) return null
  const durationMs = num(attributes.durationInMillis) ?? 0
  return {
    id: `apple:${nativeId}`,
    source: "apple",
    nativeId,
    title: text(attributes.name) || "未命名",
    artist: text(attributes.artistName) || "Apple Music",
    album: text(attributes.albumName),
    artwork: artworkUrl(record(attributes.artwork), 400),
    durationSec: Math.max(0, Math.round(durationMs / 1000)),
    bpm: null,
  }
}

function artworkUrl(artwork: Record<string, unknown> | null, size: number) {
  const template = text(artwork?.url)
  if (!template) return null
  return template.replace("{w}", String(size)).replace("{h}", String(size))
}
