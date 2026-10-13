import { isAllowedMusicBase } from "@/lib/music/allow"

interface MusicRequest {
  method?: "GET" | "POST"
  query?: Record<string, string>
  body?: unknown
  cookie?: string
}

export async function musicRequest(base: string, path: string, options: MusicRequest = {}) {
  if (!isAllowedMusicBase(base)) {
    throw new Error("只接受本机 http://127.0.0.1、http://localhost，或公网 https 源。")
  }
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    throw new Error("接口路径不合法。")
  }
  const query = options.query ?? {}
  try {
    return await requestDirect(base, path, options.method ?? "GET", query, options.body, options.cookie)
  } catch {
    return requestProxy(base, path, options.method ?? "GET", query, options.body, options.cookie)
  }
}

async function requestDirect(
  base: string,
  path: string,
  method: "GET" | "POST",
  query: Record<string, string>,
  body: unknown,
  cookie?: string
) {
  const url = new URL(path, base.endsWith("/") ? base : `${base}/`)
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value)
  const headers = new Headers()
  if (cookie) headers.set("cookie", cookie)
  if (body !== undefined) headers.set("content-type", "application/json")
  const response = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`源站返回 ${response.status}`)
  return response.json() as Promise<unknown>
}

async function requestProxy(
  base: string,
  path: string,
  method: "GET" | "POST",
  query: Record<string, string>,
  body: unknown,
  cookie?: string
) {
  const response = await fetch("/api/music-proxy", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ base, path, method, query, body, cookie }),
  })
  const payload = (await response.json()) as { error?: string; data?: unknown }
  if (!response.ok) throw new Error(payload.error || "音乐源代理失败")
  return payload.data
}
