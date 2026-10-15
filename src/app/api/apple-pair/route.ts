import { randomBytes, randomInt } from "node:crypto"
import QRCode from "qrcode"
import { isSameOriginRequest } from "@/lib/music/auth-data"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
const headers = { "Cache-Control": "no-store, private" }
interface Pair { pollKey: string; phoneKey: string; code: string; developerToken: string; expiresAt: number; userToken?: string; opened: boolean }
const globalState = globalThis as typeof globalThis & { pulsefitApplePairs?: Map<string, Pair> }
const pairs = globalState.pulsefitApplePairs ??= new Map<string, Pair>()
const secret = () => randomBytes(24).toString("hex")

export async function POST(request: Request) {
  const requestOrigin = request.headers.get("origin") || new URL(request.url).origin
  if (!isSameOriginRequest(request)) return Response.json({ error: "请求来源不匹配。" }, { status: 403, headers })
  try {
    for (const [id, pair] of pairs) if (pair.expiresAt < Date.now()) pairs.delete(id)
    const raw = await request.text()
    if (raw.length > 24_000) return Response.json({ error: "请求过大。" }, { status: 413, headers })
    const body = JSON.parse(raw) as Record<string, string>
    if (body.action === "create") {
      const developerToken = body.developerToken || process.env.APPLE_MUSIC_TOKEN || process.env.NEXT_PUBLIC_APPLE_MUSIC_TOKEN || ""
      if (!developerToken) throw new Error("请先在连接设置中填写 Apple Music 开发者令牌。")
      const publicOrigin = new URL(process.env.APP_PUBLIC_ORIGIN || requestOrigin)
      if (publicOrigin.protocol !== "https:" || /^(localhost|127\.|\[::1\])/.test(publicOrigin.hostname)) {
        throw new Error("跨设备扫码需要手机可访问的 HTTPS 网站。当前为本机预览，请先使用「在此设备授权」；部署 HTTPS 后即可扫码。")
      }
      if (pairs.size >= 100) throw new Error("登录请求较多，请稍后重试。")
      const id = secret(), pollKey = secret(), phoneKey = secret()
      const code = String(randomInt(100000, 1000000))
      pairs.set(id, { pollKey, phoneKey, code, developerToken, expiresAt: Date.now() + 300_000, opened: false })
      const url = `${publicOrigin.origin}/connect/apple#${id}.${phoneKey}`
      return Response.json({ key: id, pollKey, code, image: await QRCode.toDataURL(url, { width: 280, margin: 2 }), url, expiresIn: 300 }, { headers })
    }
    const pair = pairs.get(body.key)
    if (!pair) return Response.json({ code: 800, message: "二维码已过期，请重新生成。" }, { headers })
    const desktop = body.secret === pair.pollKey
    const phone = body.secret === pair.phoneKey
    if (!desktop && !phone) return Response.json({ error: "授权链接无效。" }, { status: 403, headers })
    if (body.action === "cancel" && desktop) { pairs.delete(body.key); return Response.json({ code: 200 }, { headers }) }
    if (body.action === "status" && desktop) {
      return Response.json(pair.userToken ? { code: 803, userToken: pair.userToken, developerToken: pair.developerToken, message: "授权完成" } : { code: pair.opened ? 802 : 801, message: pair.opened ? "手机已打开，请确认 Apple Music 授权" : "使用手机相机扫码" }, { headers })
    }
    if (body.action === "details" && phone) {
      pair.opened = true
      return Response.json({ code: 200, pairingCode: pair.code, developerToken: pair.developerToken }, { headers })
    }
    if (body.action === "complete" && phone) {
      if (!body.userToken) throw new Error("未收到 Apple 授权，请重试。")
      const validation = await fetch("https://api.music.apple.com/v1/me/storefront", { cache: "no-store", signal: AbortSignal.timeout(12_000), headers: { Authorization: `Bearer ${pair.developerToken}`, "Music-User-Token": body.userToken } })
      if (!validation.ok) throw new Error("Apple 尚未确认音乐权限，请重新授权。")
      if (!pairs.has(body.key) || pair.expiresAt < Date.now()) throw new Error("本次登录已取消或过期，请重新扫码。")
      pair.userToken = body.userToken
      return Response.json({ code: 803 }, { headers })
    }
    return Response.json({ error: "不支持此操作。" }, { status: 400, headers })
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Apple Music 连接失败。" }, { status: 400, headers })
  }
}
