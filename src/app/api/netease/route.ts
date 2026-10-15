import {
  cloudsearch, login_qr_check, login_qr_create, login_qr_key, login_status,
  lyric, playlist_track_all, song_url_v1, user_account, user_playlist,
} from "NeteaseCloudMusicApi"
import { isSameOriginRequest } from "@/lib/music/auth-data"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type ApiCall = (params: Record<string, string>) => Promise<{ body: unknown; cookie?: string[] }>
// Expose only the read and QR login operations used by this app.
const operations = new Map<string, ApiCall>([
  ["/login/qr/key", login_qr_key as ApiCall],
  ["/login/qr/create", login_qr_create as ApiCall],
  ["/login/qr/check", login_qr_check as ApiCall],
  ["/login/status", login_status as ApiCall],
  ["/user/account", user_account as ApiCall],
  ["/user/playlist", (q) => user_playlist({ ...q, uid: q.uid })],
  ["/playlist/track/all", (q) => playlist_track_all({ ...q, id: q.id })],
  ["/cloudsearch", (q) => cloudsearch({ ...q, keywords: q.keywords, type: 1 })],
  ["/song/url/v1", (q) => song_url_v1({ ...q, id: q.id, level: "exhigh" as Parameters<typeof song_url_v1>[0]["level"] })],
  ["/lyric", (q) => lyric({ ...q, id: q.id })],
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
