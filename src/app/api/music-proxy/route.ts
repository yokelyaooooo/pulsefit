import { isAllowedMusicBase } from "@/lib/music/allow"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

interface ProxyBody {
  base?: unknown
  path?: unknown
  method?: unknown
  query?: unknown
  body?: unknown
  cookie?: unknown
}

export async function POST(request: Request) {
  let payload: ProxyBody
  try {
    payload = (await request.json()) as ProxyBody
  } catch {
    return NextResponse.json({ error: "请求不是 JSON。" }, { status: 400 })
  }
  if (typeof payload.base !== "string" || !isAllowedMusicBase(payload.base)) {
    return NextResponse.json(
      { error: "只代理本机 http://127.0.0.1、http://localhost，或公网 https 音乐源。" },
      { status: 400 }
    )
  }
  if (typeof payload.path !== "string" || !payload.path.startsWith("/") || payload.path.includes("://")) {
    return NextResponse.json({ error: "接口路径不合法。" }, { status: 400 })
  }
  const method = payload.method === "POST" ? "POST" : "GET"
  const url = new URL(payload.path, payload.base.endsWith("/") ? payload.base : `${payload.base}/`)
  if (payload.query && typeof payload.query === "object" && !Array.isArray(payload.query)) {
    for (const [key, value] of Object.entries(payload.query)) {
      if (typeof value === "string" && key.length < 80 && value.length < 8000) url.searchParams.set(key, value)
    }
  }
  const headers = new Headers()
  if (typeof payload.cookie === "string" && payload.cookie.length > 0 && payload.cookie.length < 8000) {
    headers.set("cookie", payload.cookie)
  }
  if (method === "POST") headers.set("content-type", "application/json")
  let upstream: Response
  try {
    upstream = await fetch(url, {
      method,
      headers,
      body: method === "POST" ? JSON.stringify(payload.body ?? {}) : undefined,
      redirect: "manual",
    })
  } catch {
    return NextResponse.json({ error: "连不上这个音乐源。确认它正在本机运行。" }, { status: 502 })
  }
  if (upstream.status >= 300 && upstream.status < 400) {
    return NextResponse.json({ error: "音乐源要求跳转，已拒绝跟随。" }, { status: 502 })
  }
  const text = await upstream.text()
  if (text.length > 2_000_000) {
    return NextResponse.json({ error: "音乐源响应太大。" }, { status: 502 })
  }
  try {
    return NextResponse.json({ data: JSON.parse(text) }, { status: upstream.ok ? 200 : 502 })
  } catch {
    return NextResponse.json({ error: "音乐源没有返回 JSON。" }, { status: 502 })
  }
}
