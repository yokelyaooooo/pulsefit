"use client"

import { useCallback, useEffect, useState, useSyncExternalStore } from "react"
import { ArrowRight, Check, ChevronRight, Headphones, LoaderCircle, LogOut, Music2, QrCode, RefreshCw, Settings2, ShieldCheck } from "lucide-react"
import { appleAuthorize, appleDisconnect, appleLibrary, configureApple } from "@/lib/music/apple"
import { getMusicSnapshot, getServerMusicSnapshot, hydrateMusic, subscribeMusic, updateMusic } from "@/lib/music/config"
import { neteaseAccount, neteasePlaylists } from "@/lib/music/netease"
import { qqConnect, qqPlaylists } from "@/lib/music/qq"
import type { CatalogItem, MusicSettings, PlaylistItem } from "@/lib/music/types"
import { SourceMark } from "@/components/artwork"
import { PlatformLogo } from "@/components/platform-logo"
import { CoverArt } from "@/components/cover-art"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { usePlayer } from "@/components/player-provider"
import { MusicLoginDialog, providerNames, type LoginProvider } from "@/components/music-login-dialog"
import { rememberCatalog } from "@/lib/music/local"
import { tracksForPlaylist } from "@/lib/music/resolve"
import { rememberImported } from "@/lib/music/wall"
import "./music-services.css"

const providers: LoginProvider[] = ["netease", "qq", "apple"]
const subtitles = { netease: "把每一份热爱，带进训练", qq: "熟悉的旋律，新的能量", apple: "让你的音乐资料库，与你同步" }

export function SourcesScreen() {
  const settings = useSyncExternalStore(subscribeMusic, getMusicSnapshot, getServerMusicSnapshot)
  const player = usePlayer()
  const [message, setMessage] = useState("")
  const [busy, setBusy] = useState("")
  const [login, setLogin] = useState<LoginProvider | null>(null)
  const [editing, setEditing] = useState<LoginProvider | null>(null)
  const [lists, setLists] = useState<PlaylistItem[]>([])
  const [appleReady, setAppleReady] = useState(false)
  useEffect(() => { queueMicrotask(hydrateMusic) }, [])
  useEffect(() => {
    let active = true
    queueMicrotask(() => { if (active) setAppleReady(false) })
    if (settings.appleToken) void configureApple(settings.appleToken).then((music) => { if (active) setAppleReady(music.isAuthorized) }).catch(() => {})
    return () => { active = false }
  }, [settings.appleToken])

  const sync = useCallback(async (provider: LoginProvider) => {
    setBusy(provider)
    try {
      const current = getMusicSnapshot()
      const items = provider === "netease" ? await neteasePlaylists(current) : provider === "qq" ? await qqPlaylists(current) : await appleLibrary(current.appleToken)
      setLists((old) => [...old.filter((item) => item.source !== provider), ...items])
      rememberImported(items.map((item) => ({ id: item.id, title: item.name, artist: providerNames[provider], artwork: item.cover || "", source: item.source })))
      setMessage(`${providerNames[provider]} · ${items.length ? `已同步 ${items.length} 个歌单` : "已连接，暂无可同步的歌单"}`)
    } catch (error) { setMessage(error instanceof Error ? error.message : "歌单同步失败，请稍后重试。") }
    finally { setBusy("") }
  }, [])
  const connected = useCallback((provider: LoginProvider) => {
    if (provider === "apple") setAppleReady(true)
    void sync(provider)
  }, [sync])

  async function disconnect(provider: LoginProvider) {
    setBusy(provider)
    try {
      if (provider === "netease") updateMusic({ neteaseCookie: "", neteaseUid: "", neteaseName: "" })
      if (provider === "qq") updateMusic({ qqCookie: "", qqUin: "", qqName: "" })
      if (provider === "apple") { await appleDisconnect(); setAppleReady(false) }
      setLists((old) => old.filter((item) => item.source !== provider))
      setMessage(`已断开 ${providerNames[provider]}`)
    } catch { setMessage("暂时无法退出，请重试。") }
    finally { setBusy("") }
  }

  async function authorizeApple() {
    setBusy("apple")
    try {
      if (!await appleAuthorize(getMusicSnapshot().appleToken)) throw new Error("尚未完成 Apple Music 授权。")
      connected("apple")
    } catch (error) { setMessage(error instanceof Error ? error.message : "授权失败，请重试。"); setBusy("") }
  }

  async function playList(list: PlaylistItem) {
    setBusy(list.id)
    try {
      const items = await tracksForPlaylist(list.source, list.nativeId, getMusicSnapshot())
      rememberCatalog(items)
      rememberTracks(items)
      if (items[0]) { await player.playTrack(items[0].id, { queue: items.map((item) => item.id) }); setMessage(`正在播放「${list.name}」`) }
      else setMessage("这个歌单暂无可播放的歌曲。")
    } catch (error) { setMessage(error instanceof Error ? error.message : "歌单读取失败。") }
    finally { setBusy("") }
  }

  return <div className="services-page">
    <header className="services-header"><span className="services-kicker">YOUR MUSIC, CONNECTED</span><h1>音乐，与你同频。</h1><p>连接你喜欢的平台，让熟悉的旋律陪你完成每一次训练。</p></header>
    <div className="services-benefits"><span><Headphones size={14} />你的音乐，你的节奏</span><span><ShieldCheck size={14} />平台扫码授权</span></div>
    {message && <p className="services-message" role="status">{message}</p>}
    <div className="services-grid">{providers.map((provider) => {
      const name = provider === "netease" ? settings.neteaseName || (settings.neteaseUid ? "网易云用户" : "") : provider === "qq" ? settings.qqName || (settings.qqUin ? `QQ ${settings.qqUin}` : "") : appleReady ? "Apple Music 已授权" : ""
      return <section key={provider} className={`service-card service-${provider}`} aria-label={providerNames[provider]}>
        <div className="service-card-top"><span className={`service-state ${name ? "is-connected" : ""}`}>{name ? <Check size={11} /> : <span />}{name ? "已连接" : "未连接"}</span><button type="button" className="service-settings-button" aria-label={`${providerNames[provider]}连接设置`} disabled={Boolean(busy)} onClick={() => setEditing(provider)}><Settings2 size={17} /></button></div>
        <div className="service-identity"><div className="service-platform-icon"><PlatformLogo source={provider} className="size-16 rounded-[20px]" /></div><h2>{providerNames[provider]}</h2><p>{name || subtitles[provider]}</p></div>
        <ul className="service-features"><li><Check size={13} />{provider === "apple" ? "同步个人音乐资料库" : "同步收藏与个人歌单"}</li><li><Check size={13} />搜索音乐与在线播放</li><li><Check size={13} />{provider === "qq" ? "手机 QQ 扫码确认" : provider === "apple" ? "手机相机扫码 · Apple 官方授权" : "网易云 App 扫码确认"}</li></ul>
        <div className="service-card-actions">{name ? <><Button disabled={Boolean(busy)} className="service-connect-button" onClick={() => void sync(provider)}>{busy === provider ? <LoaderCircle size={16} className="animate-spin" /> : <RefreshCw size={16} />}同步歌单</Button><button className="service-secondary" disabled={Boolean(busy)} onClick={() => void disconnect(provider)}><LogOut size={13} />断开连接</button></> : <><Button disabled={Boolean(busy)} className="service-connect-button" onClick={() => setLogin(provider)}><QrCode size={17} />扫码登录<ArrowRight size={15} /></Button><button className="service-secondary" disabled={Boolean(busy)} onClick={() => provider === "apple" ? void authorizeApple() : setEditing(provider)}>{provider === "apple" ? "在此设备授权" : "其他连接方式"}<ChevronRight size={12} /></button></>}</div>
      </section>
    })}</div>
    <section className="services-local"><div className="services-local-icon"><Music2 size={23} /></div><div><h2>本地训练节拍<span>始终可用</span></h2><p>无需登录，随时跟上自己的节奏。</p></div><CheckCircle /></section>
    <p className="services-footnote">音乐播放范围取决于你的账号、订阅及所在地区。扫码仅用于连接你的个人账号。</p>
    {lists.length > 0 && <section className="services-playlists"><header><h2>你的歌单</h2><span>{lists.length} 个歌单</span></header><div>{lists.map((list) => <button key={list.id} disabled={Boolean(busy)} onClick={() => void playList(list)}>{list.cover?.startsWith("https://") ? <CoverArt seed={list.id} title={list.name} artwork={list.cover} className="services-playlist-cover" /> : <SourceMark source={list.source} className="size-12 rounded-xl" />}<span><strong>{list.name}</strong><small>{providerNames[list.source as LoginProvider]}{list.trackCount != null ? ` · ${list.trackCount} 首` : ""}</small></span><ChevronRight size={17} /></button>)}</div></section>}
    {login && <MusicLoginDialog provider={login} onClose={() => setLogin(null)} onConnected={connected} />}
    {editing && <ConnectionSettings key={editing} provider={editing} settings={settings} onClose={() => setEditing(null)} onConnected={connected} onSaved={(note) => { setMessage(note); setEditing(null) }} />}
  </div>
}

function CheckCircle() { return <span className="services-local-check"><Check size={17} /></span> }

function ConnectionSettings({ provider, settings, onClose, onConnected, onSaved }: { provider: LoginProvider; settings: MusicSettings; onClose: () => void; onConnected: (provider: LoginProvider) => void; onSaved: (note: string) => void }) {
  const [base, setBase] = useState(provider === "netease" ? settings.neteaseBase : settings.qqBase)
  const [credential, setCredential] = useState(provider === "apple" ? settings.appleToken : "")
  const [visible, setVisible] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  async function save(connect: boolean) {
    setBusy(true); setError("")
    try {
      const current = getMusicSnapshot()
      if (provider === "apple") { await appleDisconnect(); updateMusic({ appleToken: credential.trim() }); onSaved("Apple Music 连接设置已保存，请扫码或在此设备授权。"); return }
      if (!base.trim()) throw new Error("请输入音乐服务地址。")
      if (connect) {
        if (!credential.trim()) throw new Error("请填写你自己账号的 Cookie。")
        if (provider === "netease") {
          const account = await neteaseAccount({ ...current, neteaseBase: base.trim(), neteaseCookie: credential.trim() })
          updateMusic({ neteaseBase: base.trim(), neteaseCookie: credential.trim(), neteaseUid: account.uid, neteaseName: account.name || "网易云用户" })
        } else {
          const account = await qqConnect({ ...current, qqBase: base.trim(), qqCookie: credential.trim() })
          updateMusic({ qqBase: base.trim(), qqCookie: account.cookie, qqUin: account.uin, qqName: account.name })
        }
        onConnected(provider); onClose()
      } else {
        if (provider === "netease") updateMusic({ neteaseBase: base.trim(), ...(base.trim() !== current.neteaseBase ? { neteaseCookie: "", neteaseName: "", neteaseUid: "" } : {}) })
        else updateMusic({ qqBase: base.trim(), ...(base.trim() !== current.qqBase ? { qqCookie: "", qqName: "", qqUin: "" } : {}) })
        onSaved("连接设置已保存。")
      }
    } catch (error) { setError(error instanceof Error ? error.message : "连接失败，请重试。") }
    finally { setBusy(false) }
  }
  return <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose() }}><DialogContent className="service-settings-dialog"><DialogTitle>{providerNames[provider]} · 连接设置</DialogTitle><DialogDescription>{provider === "apple" ? "Apple Music 需要开发者令牌，才能向 Apple 发起授权。跨设备扫码还需要将网站部署到 HTTPS 地址。" : "默认使用内置连接，无需单独启动服务。也可以配置自己的兼容服务，或导入已有账号授权。"}</DialogDescription>
    {provider !== "apple" && <label className="service-field">音乐服务地址<Input value={base} onChange={(event) => setBase(event.target.value)} aria-label={`${providerNames[provider]}服务地址`} /><button onClick={() => setBase(provider === "netease" ? "/api/netease" : "/api/qq")}>恢复内置连接</button></label>}
    <label className="service-field">{provider === "apple" ? "Developer token" : "账号 Cookie（仅手动导入时填写）"}<Input type={visible ? "text" : "password"} autoComplete="off" spellCheck={false} value={credential} onChange={(event) => setCredential(event.target.value)} aria-label={`${providerNames[provider]}${provider === "apple" ? "开发者令牌" : "账号 Cookie"}`} placeholder={provider === "apple" ? "填写 MusicKit developer token" : "仅填写你自己账号的完整 Cookie"} /><button type="button" onClick={() => setVisible(!visible)}>{visible ? "隐藏" : "显示"}内容</button></label>
    {provider !== "apple" && <a className="service-official-link" href={provider === "qq" ? "https://y.qq.com/" : "https://music.163.com/"} target="_blank" rel="noreferrer">前往 {providerNames[provider]} 官网<ArrowRight size={13} /></a>}
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    <div className="flex flex-wrap gap-2"><Button disabled={busy} onClick={() => void save(false)}>保存设置</Button>{provider !== "apple" && <Button variant="secondary" disabled={busy || !credential.trim()} onClick={() => void save(true)}>{busy ? "正在验证…" : "验证并导入"}</Button>}</div>
  </DialogContent></Dialog>
}

function rememberTracks(items: CatalogItem[]) {
  rememberImported(items.map((item) => ({ id: item.id, title: item.title, artist: item.artist || item.album, artwork: item.artwork || "", source: item.source })))
}
