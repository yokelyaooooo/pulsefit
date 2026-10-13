import { musicRequest } from "@/lib/music/http"
import {
  readNeteaseAccount,
  readNeteaseLyric,
  readNeteasePlaylists,
  readNeteaseSongs,
  readNeteaseUrl,
  readQrCheck,
  readQrImage,
  readQrKey,
} from "@/lib/music/parse"
import type { MusicSettings } from "@/lib/music/types"

function query(settings: MusicSettings, extra: Record<string, string> = {}) {
  const params: Record<string, string> = { timestamp: String(Date.now()), ...extra }
  if (settings.neteaseCookie) params.cookie = settings.neteaseCookie
  return params
}

export async function neteaseQrStart(settings: MusicSettings) {
  const keyPayload = await musicRequest(settings.neteaseBase, "/login/qr/key", { query: query(settings) })
  const key = readQrKey(keyPayload)
  if (!key) throw new Error("网易云没有返回二维码 key。确认 NeteaseCloudMusicApi 已在这个地址运行。")
  const imagePayload = await musicRequest(settings.neteaseBase, "/login/qr/create", {
    query: query(settings, { key, qrimg: "true" }),
  })
  const image = readQrImage(imagePayload)
  if (!image.image && !image.url) throw new Error("网易云没有返回二维码图片。")
  return { key, ...image }
}

export async function neteaseQrPoll(settings: MusicSettings, key: string) {
  const payload = await musicRequest(settings.neteaseBase, "/login/qr/check", {
    query: query(settings, { key }),
  })
  return readQrCheck(payload)
}

export async function neteaseAccount(settings: MusicSettings) {
  const payload = await musicRequest(settings.neteaseBase, "/user/account", { query: query(settings) })
  const account = readNeteaseAccount(payload)
  if (!account.uid) throw new Error("网易云 cookie 还不能读到账号。重新扫码登录。")
  return account
}

export async function neteasePlaylists(settings: MusicSettings) {
  if (!settings.neteaseUid) throw new Error("先扫码登录网易云，才能同步歌单。")
  const payload = await musicRequest(settings.neteaseBase, "/user/playlist", {
    query: query(settings, { uid: settings.neteaseUid }),
  })
  return readNeteasePlaylists(payload)
}

export async function neteasePlaylistTracks(settings: MusicSettings, playlistId: string) {
  const payload = await musicRequest(settings.neteaseBase, "/playlist/track/all", {
    query: query(settings, { id: playlistId, limit: "100", offset: "0" }),
  })
  return readNeteaseSongs(payload)
}

export async function neteaseSearch(settings: MusicSettings, term: string) {
  const payload = await musicRequest(settings.neteaseBase, "/cloudsearch", {
    query: query(settings, { keywords: term, type: "1", limit: "20" }),
  })
  return readNeteaseSongs(payload)
}

export async function neteaseSong(settings: MusicSettings, nativeId: string) {
  const [urlPayload, lyricPayload] = await Promise.all([
    musicRequest(settings.neteaseBase, "/song/url/v1", {
      query: query(settings, { id: nativeId, level: "exhigh" }),
    }),
    musicRequest(settings.neteaseBase, "/lyric", { query: query(settings, { id: nativeId }) }).catch(() => null),
  ])
  const media = readNeteaseUrl(urlPayload, nativeId)
  return {
    ...media,
    lyric: lyricPayload ? readNeteaseLyric(lyricPayload) : "",
    note: media.url
      ? media.previewOnly
        ? "网易云返回的是试听。完整歌曲取决于登录账号和会员。"
        : null
      : "网易云没有给出播放地址。未登录或非会员时这很常见。",
  }
}
