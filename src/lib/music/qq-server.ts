import { randomBytes, randomUUID } from "node:crypto"
import { cookieHeader, parseCookies, parseQqQrReply, qqHash, trustedQqUrl } from "./auth-data"

type Json = Record<string, unknown>
type QrSession = { cookies: Record<string, string>; expiresAt: number; pending?: Promise<Json>; result?: Json }
const globalState = globalThis as typeof globalThis & { pulsefitQqSessions?: Map<string, QrSession> }
const sessions = globalState.pulsefitQqSessions ??= new Map<string, QrSession>()
const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/132.0.0.0 Safari/537.36"

async function qqFetch(url: string, cookies: Record<string, string>, options: RequestInit = {}) {
  if (!trustedQqUrl(url)) throw new Error("平台授权地址不合法。")
  const response = await fetch(url, {
    ...options, redirect: "manual", cache: "no-store", signal: AbortSignal.timeout(12_000),
    headers: { "User-Agent": ua, Referer: "https://y.qq.com/", Cookie: cookieHeader(cookies), ...options.headers },
  })
  for (const cookie of response.headers.getSetCookie()) Object.assign(cookies, parseCookies(cookie.split(";")[0]))
  if (!response.ok && (response.status < 300 || response.status >= 400)) throw new Error("QQ 音乐连接失败，请稍后重试。")
  return response
}

function urlFor(path: string, query: Record<string, string>) {
  const url = new URL(path)
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value)
  return url.href
}

async function rpc(module: string, method: string, param: Json, cookies: Record<string, string>): Promise<Json> {
  const response = await qqFetch("https://u.y.qq.com/cgi-bin/musicu.fcg", cookies, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ comm: { ct: 24, cv: 0, format: "json", uin: cookies.uin || "0", g_tk: qqHash(cookies.p_skey || cookies.skey || "", 5381) }, request: { module, method, param } }),
  })
  const payload = await response.json() as { code?: number; request?: { code?: number; data?: Json } }
  if (payload.code || payload.request?.code || !payload.request?.data) throw new Error("QQ 音乐未完成授权或当前接口不可用，请重试。")
  return payload.request.data
}

function cleanSessions() {
  for (const [key, session] of sessions) if (session.expiresAt < Date.now()) sessions.delete(key)
}

export async function qqQrCreate() {
  cleanSessions()
  if (sessions.size >= 100) throw new Error("登录请求较多，请稍后重试。")
  const cookies: Record<string, string> = {}
  const response = await qqFetch(urlFor("https://ssl.ptlogin2.qq.com/ptqrshow", {
    appid: "716027609", e: "2", l: "M", s: "3", d: "72", v: "4", daid: "383", pt_3rd_aid: "100497308", t: String(Math.random()),
    u1: "https://graph.qq.com/oauth2.0/login_jump",
  }), cookies)
  const bytes = Buffer.from(await response.arrayBuffer())
  const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  if (!cookies.qrsig || !png) throw new Error("QQ 音乐暂时无法生成二维码。")
  const key = randomBytes(24).toString("hex")
  sessions.set(key, { cookies, expiresAt: Date.now() + 180_000 })
  return { key, image: `data:image/png;base64,${bytes.toString("base64")}`, url: null }
}

async function poll(session: QrSession): Promise<Json> {
  const response = await qqFetch(urlFor("https://ssl.ptlogin2.qq.com/ptqrlogin", {
    u1: "https://graph.qq.com/oauth2.0/login_jump", ptqrtoken: String(qqHash(session.cookies.qrsig)),
    ptredirect: "0", h: "1", t: "1", g: "1", from_ui: "1", ptlang: "2052", action: `0-0-${Date.now()}`,
    js_ver: "23111510", js_type: "1", login_sig: session.cookies.pt_login_sig || "", pt_uistyle: "40",
    aid: "716027609", daid: "383", pt_3rd_aid: "100497308",
  }), session.cookies)
  const reply = parseQqQrReply(await response.text())
  if (reply.status === 65) return { code: 800, message: "二维码已过期" }
  if (reply.status === 66) return { code: 801, message: "使用手机 QQ 扫码" }
  if (reply.status === 67) return { code: 802, message: "已扫码，请在手机 QQ 中确认" }
  if (reply.status !== 0) throw new Error("QQ 未批准本次登录，请刷新二维码重试。")
  await qqFetch(reply.redirect, session.cookies)
  if (!session.cookies.p_skey) throw new Error("QQ 授权未完成，请重新扫码。")
  const authorization = await qqFetch("https://graph.qq.com/oauth2.0/authorize", session.cookies, {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ response_type: "code", client_id: "100497308", redirect_uri: "https://y.qq.com/portal/wx_redirect.html?login_type=1&surl=https://y.qq.com/", scope: "get_user_info,get_app_friends", state: randomUUID(), from_ptlogin: "1", src: "1", update_auth: "1", openapi: "1010_1030", g_tk: String(qqHash(session.cookies.p_skey, 5381)), auth_time: String(Date.now()), ui: randomUUID() }),
  })
  const redirect = authorization.headers.get("location") || ""
  if (!trustedQqUrl(redirect)) throw new Error("QQ 音乐需要额外确认，请重新扫码授权。")
  const code = new URL(redirect).searchParams.get("code")
  if (!code) throw new Error("QQ 音乐没有返回授权结果。")
  const account = await rpc("QQConnectLogin.LoginServer", "QQLogin", { code }, session.cookies)
  const uin = String(account.musicid || session.cookies.uin || "").replace(/^o/, "")
  const key = String(account.musickey || session.cookies.qm_keyst || session.cookies.qqmusic_key || "")
  if (!uin || !key) throw new Error("QQ 账号已确认，但音乐授权尚未完成，请重试。")
  // Keep only music credentials; discard the general QQ login cookies.
  const cookie = cookieHeader({ uin, qm_keyst: key, qqmusic_key: key, login_type: "1" })
  const result = { code: 803, message: "登录成功", cookie, uin, name: String(account.nick || account.nickname || reply.name || `QQ ${uin}`) }
  session.cookies = {}
  session.result = result
  return result
}

export async function qqQrCheck(key: string) {
  cleanSessions()
  const session = sessions.get(key)
  if (!session) return { code: 800, message: "二维码已过期" }
  if (session.result) return session.result
  if (!session.pending) session.pending = poll(session).finally(() => { session.pending = undefined })
  return session.pending
}

export function qqQrCancel(key: string) { sessions.delete(key) }

export async function qqOperation(path: string, query: Record<string, string>, rawCookie: string) {
  const cookies = parseCookies(rawCookie)
  const uin = cookies.uin || cookies.wxuin || "0"
  if (path === "/user/refresh") {
    const data = await rpc("QQConnectLogin.LoginServer", "QQLogin", { musicid: uin, musickey: cookies.qm_keyst || cookies.qqmusic_key, expired_in: 7776000 }, cookies)
    if (!data.musickey) throw new Error("登录已失效，请重新扫码。")
    return { result: 100, data: { musickey: data.musickey, nickname: data.nick || data.nickname } }
  }
  if (path === "/search") {
    return rpc("music.search.SearchCgiService", "DoSearchForQQMusicDesktop", { query: query.key, search_type: 0, num_per_page: 20, page_num: 1 }, cookies)
  }
  if (path === "/song/urls") {
    const data = await rpc("vkey.GetVkeyServer", "CgiGetVkey", { songmid: [query.id], songtype: [0], uin, loginflag: 1, platform: "20", guid: String(Date.now()) }, cookies)
    const info = data.midurlinfo as { purl?: string }[] | undefined
    const sip = data.sip as string[] | undefined
    return { data: { [query.id]: info?.[0]?.purl ? `${sip?.[0] || ""}${info[0].purl}` : "" } }
  }
  const routes: Record<string, [string, Record<string, string>]> = {
    "/user/songlist": ["https://c.y.qq.com/rsc/fcgi-bin/fcg_user_created_diss", { hostuin: query.id || uin, sin: "0", size: "100", g_tk: "5381", loginUin: uin, format: "json", inCharset: "utf8", outCharset: "utf-8", platform: "yqq.json", needNewCode: "0" }],
    "/songlist": ["https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg", { disstid: query.id, type: "1", json: "1", utf8: "1", onlysong: "0", format: "json" }],
    "/lyric": ["https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg", { songmid: query.songmid, format: "json", nobase64: "1" }],
  }
  const route = routes[path]
  if (!route) throw new Error("不支持此音乐操作。")
  return (await qqFetch(urlFor(route[0], route[1]), cookies)).json()
}
