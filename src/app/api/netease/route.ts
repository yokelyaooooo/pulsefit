import cloudsearch from "NeteaseCloudMusicApi/module/cloudsearch"
import loginQrCheck from "NeteaseCloudMusicApi/module/login_qr_check"
import loginQrCreate from "NeteaseCloudMusicApi/module/login_qr_create"
import loginQrKey from "NeteaseCloudMusicApi/module/login_qr_key"
import loginStatus from "NeteaseCloudMusicApi/module/login_status"
import lyric from "NeteaseCloudMusicApi/module/lyric"
import playlistTrackAll from "NeteaseCloudMusicApi/module/playlist_track_all"
import songUrlV1 from "NeteaseCloudMusicApi/module/song_url_v1"
import userAccount from "NeteaseCloudMusicApi/module/user_account"
import userPlaylist from "NeteaseCloudMusicApi/module/user_playlist"
import neteaseRequest from "NeteaseCloudMusicApi/util/request"
import { isSameOriginRequest } from "@/lib/music/auth-data"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type ApiResult = { body: unknown; cookie?: string[] }
type NeteaseModule = (
  params: Record<string, unknown>,
  request: typeof neteaseRequest,
) => Promise<ApiResult>
type ApiCall = (params: Record<string, string>) => Promise<ApiResult>

function cookieToObject(cookie: string) {
  return Object.fromEntries(cookie.split(";").flatMap((part) => {
    const separator = part.indexOf("=")
    if (separator < 1) return []
    return [[part.slice(0, separator).trim(), part.slice(separator + 1).trim()]]
  }))
}

function bindModule(operation: NeteaseModule): ApiCall {
  return (params) => operation({
    ...params,
    cookie: typeof params.cookie === "string" ? cookieToObject(params.cookie) : {},
  }, neteaseRequest)
}

// Expose only the read and QR login operations used by this app.
const operations = new Map<string, ApiCall>([
  ["/login/qr/key", bindModule(loginQrKey)],
  ["/login/qr/create", bindModule(loginQrCreate)],
  ["/login/qr/check", bindModule(loginQrCheck)],
  ["/login/status", bindModule(loginStatus)],
  ["/user/account", bindModule(userAccount)],
  ["/user/playlist", bindModule(userPlaylist)],
  ["/playlist/track/all", bindModule(playlistTrackAll)],
  ["/cloudsearch", bindModule(cloudsearch)],
  ["/song/url/v1", bindModule(songUrlV1)],
  ["/lyric", bindModule(lyric)],
])
const allowedParams = new Set(["cookie", "key", "qrimg", "uid", "id", "keywords", "type", "limit", "offset", "level", "noCookie"])
const headers = { "Cache-Control": "no-store, private" }

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return Response.json({ error: "请求来源不匹配。" }, { status: 403, headers })
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    const raw = await request.text()
    if (raw.length > 24_000) return Response.json({ error: "请求过大。" }, { status: 413, headers })
    const payload = JSON.parse(raw) as { path?: string; query?: Record<string, unknown> }
    const operation = operations.get(payload.path ?? "")
    if (!operation) return Response.json({ error: "不支持此音乐操作。" }, { status: 400, headers })
    const query: Record<string, string> = { timestamp: String(Date.now()) }
    for (const [key, value] of Object.entries(payload.query ?? {})) {
      if (allowedParams.has(key) && typeof value === "string" && value.length < 16_000) query[key] = value
    }
    const result = await Promise.race([
      operation(query),
      new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("timeout")), 15_000) }),
    ])
    const data = result.body as Record<string, unknown>
    if (payload.path === "/login/qr/check" && data?.code === 803 && !data.cookie && result.cookie?.length) {
      data.cookie = result.cookie.map((cookie) => cookie.split(";")[0]).join("; ")
    }
    return Response.json({ data }, { headers })
  } catch (error) {
    const syntax = error instanceof SyntaxError
    return Response.json({ error: syntax ? "请求格式有误。" : "网易云暂时无法连接，请稍后重试，或在连接设置中切换服务。" }, { status: syntax ? 400 : 502, headers })
  } finally {
    if (timer) clearTimeout(timer)
  }
}
