import { qqOperation, qqQrCancel, qqQrCheck, qqQrCreate } from "@/lib/music/qq-server"
import { isSameOriginRequest } from "@/lib/music/auth-data"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
const headers = { "Cache-Control": "no-store, private" }

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return Response.json({ error: "请求来源不匹配。" }, { status: 403, headers })
  try {
    const raw = await request.text()
    if (raw.length > 24_000) return Response.json({ error: "请求过大。" }, { status: 413, headers })
    const payload = JSON.parse(raw) as { path: string; query?: Record<string, string>; cookie?: string }
    const query = payload.query ?? {}
    let data: unknown
    if (payload.path === "/login/qr/start") data = await qqQrCreate()
    else if (payload.path === "/login/qr/check") data = await qqQrCheck(query.key)
    else if (payload.path === "/login/qr/cancel") { qqQrCancel(query.key); data = { code: 200 } }
    else data = await qqOperation(payload.path, query, payload.cookie || "")
    return Response.json({ data }, { headers })
  } catch (error) {
    return Response.json({ error: error instanceof Error && !error.message.includes("fetch") ? error.message : "QQ 音乐连接失败，请稍后重试。" }, { status: 502, headers })
  }
}
