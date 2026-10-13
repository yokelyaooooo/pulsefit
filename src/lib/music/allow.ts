function isPrivateIpv4(host: string) {
  const parts = host.split(".").map((part) => Number(part))
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return false
  }
  const [a, b] = parts
  if (a === 10 || a === 0 || a === 127) return true
  if (a === 169 && b === 254) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && b === 168) return true
  if (a === 100 && b >= 64 && b <= 127) return true
  return false
}

export function isAllowedMusicBase(input: string) {
  let url: URL
  try {
    url = new URL(input)
  } catch {
    return false
  }
  if (url.username || url.password) return false
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "")
  if (host === "metadata.google.internal" || host.endsWith(".internal")) return false
  if (url.protocol === "http:") {
    return host === "127.0.0.1" || host === "localhost"
  }
  if (url.protocol !== "https:") return false
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".localhost")) return false
  if (host.includes(":")) {
    const v6 = host.split("%")[0]
    if (v6 === "::1" || v6.startsWith("fc") || v6.startsWith("fd") || v6.startsWith("fe80")) return false
  }
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host) && isPrivateIpv4(host)) return false
  return true
}
