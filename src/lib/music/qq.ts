import { musicRequest } from "@/lib/music/http"
import { qqUinFromCookie, readQqLyric, readQqPlaylists, readQqSongs, readQqUrls } from "@/lib/music/parse"
import type { MusicSettings } from "@/lib/music/types"

async function bindCookie(settings: MusicSettings) {
  if (!settings.qqCookie.trim()) throw new Error("先粘贴你自己的 QQ 音乐 cookie。")
  await musicRequest(settings.qqBase, "/user/setCookie", {
    method: "POST",
    body: { data: settings.qqCookie.trim() },
  })
}

export function describeQqCookie(cookie: string) {
  const uin = qqUinFromCookie(cookie)
  return { uin, name: uin ? `QQ ${uin}` : "" }
}

export async function qqConnect(settings: MusicSettings) {
  await bindCookie(settings)
  const identity = describeQqCookie(settings.qqCookie)
  if (!identity.uin && !settings.qqUin) {
    throw new Error("cookie 里没有 uin。请粘贴包含 uin 的整段 cookie，或另外填写 QQ 号。")
  }
  return { uin: identity.uin || settings.qqUin, name: identity.name || `QQ ${settings.qqUin}` }
}

export async function qqPlaylists(settings: MusicSettings) {
  await bindCookie(settings)
  const uin = settings.qqUin || qqUinFromCookie(settings.qqCookie)
  if (!uin) throw new Error("缺少 QQ 号，无法拉取歌单。")
  const payload = await musicRequest(settings.qqBase, "/user/songlist", { query: { id: uin } })
  return readQqPlaylists(payload)
}

export async function qqPlaylistTracks(settings: MusicSettings, playlistId: string) {
  await bindCookie(settings)
  const payload = await musicRequest(settings.qqBase, "/songlist", { query: { id: playlistId } })
  return readQqSongs(payload)
}

export async function qqSearch(settings: MusicSettings, term: string) {
  await bindCookie(settings)
  const payload = await musicRequest(settings.qqBase, "/search", { query: { key: term, page: "1", t: "0" } })
  return readQqSongs(payload)
}

export async function qqSong(settings: MusicSettings, nativeId: string) {
  await bindCookie(settings)
  const [urlPayload, lyricPayload] = await Promise.all([
    musicRequest(settings.qqBase, "/song/urls", { query: { id: nativeId } }),
    musicRequest(settings.qqBase, "/lyric", { query: { songmid: nativeId } }).catch(() => null),
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
