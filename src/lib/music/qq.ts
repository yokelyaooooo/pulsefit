import { musicRequest } from "@/lib/music/http"
import { qqUinFromCookie, readQqLyric, readQqPlaylists, readQqSongs, readQqUrls } from "@/lib/music/parse"
import type { MusicSettings } from "@/lib/music/types"
import { cookieHeader, parseCookies } from "@/lib/music/auth-data"

function accountCookie(settings: MusicSettings) {
  const cookies = parseCookies(settings.qqCookie)
  const uin = qqUinFromCookie(settings.qqCookie) || settings.qqUin
  if (!uin || !(cookies.qm_keyst || cookies.qqmusic_key)) throw new Error("音乐授权不完整，请扫码登录，或导入包含音乐授权的 Cookie。")
  return cookieHeader({ ...cookies, uin })
}

export function describeQqCookie(cookie: string) {
  const uin = qqUinFromCookie(cookie)
  return { uin, name: uin ? `QQ ${uin}` : "" }
}

export async function qqConnect(settings: MusicSettings) {
  const cookie = accountCookie(settings)
  const payload = await musicRequest(settings.qqBase, "/user/refresh", { cookie }) as { data?: { musickey?: string; nickname?: string } }
  if (!payload.data?.musickey) throw new Error("登录校验失败，请重新扫码授权。")
  const uin = qqUinFromCookie(cookie)
  return { uin, name: payload.data.nickname || `QQ ${uin}`, cookie: cookieHeader({ ...parseCookies(cookie), qm_keyst: payload.data.musickey, qqmusic_key: payload.data.musickey }) }
}

export async function qqQrStart(signal?: AbortSignal) {
  return await musicRequest("/api/qq", "/login/qr/start", { signal }) as { key: string; image: string; url: null }
}

export async function qqQrPoll(key: string, signal?: AbortSignal) {
  return await musicRequest("/api/qq", "/login/qr/check", { query: { key }, signal }) as { code: number; cookie?: string; uin?: string; name?: string; message: string }
}

export async function qqQrCancel(key: string) {
  await musicRequest("/api/qq", "/login/qr/cancel", { query: { key } }).catch(() => {})
}

export async function qqPlaylists(settings: MusicSettings) {
  const cookie = accountCookie(settings)
  const uin = settings.qqUin || qqUinFromCookie(settings.qqCookie)
  if (!uin) throw new Error("缺少 QQ 号，无法拉取歌单。")
  const payload = await musicRequest(settings.qqBase, "/user/songlist", { query: { id: uin }, cookie })
  return readQqPlaylists(payload)
}

export async function qqPlaylistTracks(settings: MusicSettings, playlistId: string) {
  const cookie = accountCookie(settings)
  const payload = await musicRequest(settings.qqBase, "/songlist", { query: { id: playlistId }, cookie })
  return readQqSongs(payload)
}

export async function qqSearch(settings: MusicSettings, term: string) {
  const cookie = accountCookie(settings)
  const payload = await musicRequest(settings.qqBase, "/search", { query: { key: term, page: "1", t: "0" }, cookie })
  return readQqSongs(payload)
}

export async function qqSong(settings: MusicSettings, nativeId: string) {
  const cookie = accountCookie(settings)
  const [urlPayload, lyricPayload] = await Promise.all([
    musicRequest(settings.qqBase, "/song/urls", { query: { id: nativeId }, cookie }),
    musicRequest(settings.qqBase, "/lyric", { query: { songmid: nativeId }, cookie }).catch(() => null),
  ])
  const urls = readQqUrls(urlPayload)
  const url = urls[nativeId] || Object.values(urls).find(Boolean) || null
  return {
    url,
    previewOnly: false,
    lyric: lyricPayload ? readQqLyric(lyricPayload) : "",
    note: url ? null : "QQ 音乐没有给出播放地址。非会员或 cookie 失效时会这样。",
  }
}
