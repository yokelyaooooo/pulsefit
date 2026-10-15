import { isAllowedMusicBase } from "@/lib/music/allow"

interface MusicRequest {
  method?: "GET" | "POST"
  query?: Record<string, string>
  body?: unknown
  cookie?: string
  signal?: AbortSignal
}

export async function musicRequest(base: string, path: string, options: MusicRequest = {}) {
  const builtin = base === "/api/netease" || base === "/api/qq"
  if (!builtin && !isAllowedMusicBase(base)) throw new Error("请输入本机服务地址或 HTTPS 音乐服务地址。")
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) throw new Error("接口路径不合法。")
  const signal = options.signal
    ? AbortSignal.any([options.signal, AbortSignal.timeout(20_000)])
    : AbortSignal.timeout(20_000)
  let response: Response
  try {
    // Keep credentials out of browser URLs and history.
    response = await fetch(builtin ? base : "/api/music-proxy", {
      method: "POST",
      headers: { "content-type": "application/json" },
      cache: "no-store",
      signal,
      body: JSON.stringify({ base, path, method: options.method ?? "GET", query: options.query ?? {}, body: options.body, cookie: options.cookie }),
    })
  } catch (error) {
    if (options.signal?.aborted) throw error
    throw new Error(signal.aborted ? "连接超时，请稍后重试。" : "连接失败，请检查网络或音乐服务地址。")
  }
  const payload = await response.json() as { error?: string; data?: unknown }
  if (!response.ok) throw new Error(payload.error || "音乐服务暂时不可用，请稍后重试。")
  const data = payload.data as { code?: number; result?: unknown; message?: string; msg?: string; errMsg?: string } | undefined
  if (typeof data?.result === "number" && data.result !== 100) throw new Error(data.errMsg || "登录已失效，请重新登录。")
  if (data?.code && data.code !== 200 && data.code !== 0 && !path.startsWith("/login/qr/")) {
    throw new Error(data.code === 301 || data.code === 401 ? "登录已失效，请重新登录。" : data.message || data.msg || "音乐平台暂时无法完成请求。")
  }
  return payload.data
}
