export function parseCookies(input: string) {
  const result: Record<string, string> = {}
  for (const part of input.replace(/^cookie:\s*/i, "").split(";")) {
    const separator = part.indexOf("=")
    if (separator < 1) continue
    const key = part.slice(0, separator).trim()
    const value = part.slice(separator + 1).trim()
    if (/^[\w-]+$/.test(key) && value && !/[\r\n]/.test(value)) result[key] = value
  }
  return result
}

export function cookieHeader(cookies: Record<string, string>) {
  return Object.entries(cookies).map(([key, value]) => `${key}=${value}`).join("; ")
}

export function qqHash(value: string, initial = 0) {
  let hash = initial
  for (let i = 0; i < value.length; i++) hash = (hash * 33 + value.charCodeAt(i)) & 0x7fffffff
  return hash
}

export function parseQqQrReply(input: string) {
  // Parse the provider's JSONP arguments as text; never execute its JavaScript.
  const args = [...input.matchAll(/'((?:\\.|[^'\\])*)'/g)].map((match) => match[1].replace(/\\'/g, "'"))
  const status = Number(args[0])
  if (!input.startsWith("ptuiCB(") || !Number.isInteger(status)) throw new Error("二维码状态格式无效。")
  return { status, redirect: args[2] ?? "", name: args[5] ?? "" }
}

export function trustedQqUrl(input: string) {
  try {
    const url = new URL(input)
    return url.protocol === "https:" && !url.username && !url.password && (url.hostname === "qq.com" || url.hostname.endsWith(".qq.com"))
  } catch { return false }
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin")
  if (!origin) return true
  try {
    const url = new URL(origin)
    const host = request.headers.get("host") || new URL(request.url).host
    return (url.protocol === "http:" || url.protocol === "https:") && url.host === host
  } catch { return false }
}
